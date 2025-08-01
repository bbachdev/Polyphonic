use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;
use axum::{Router, routing::get, extract::Path, extract::State, http::{header, StatusCode}, response::IntoResponse};
use std::sync::Arc;
use tokio::fs;
use tokio::sync::Mutex;

struct AppState {
  app_data_dir: PathBuf,
}

// Global server handle for shutdown
static SERVER_HANDLE: Mutex<Option<tokio::task::JoinHandle<()>>> = Mutex::const_new(None);

pub async fn init_server(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  let app_data_dir = app_handle.path().app_data_dir().unwrap();
  let shared_state = Arc::new(AppState { app_data_dir });
  let app_router: Router = Router::new().route("/get-image/{cover_art_id}", get(serve_image)).with_state(shared_state);

  let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
  let server_task = tokio::spawn(async move {
    match axum::serve(listener, app_router).await {
      Ok(_) => {},
      Err(e) => eprintln!("Art server error: {}", e),
    }
  });

  // Store the server handle for later shutdown
  *SERVER_HANDLE.lock().await = Some(server_task);

  Ok(())
}

async fn serve_image(Path(cover_art_id): Path<String>, State(state): State<Arc<AppState>>) -> impl IntoResponse {
  let cover_art_path = state.app_data_dir.join("cover_art").join(cover_art_id);
  
  if !cover_art_path.exists() {
    return (StatusCode::NOT_FOUND, "Image not found").into_response();
  }
  
  let image_data = match fs::read(&cover_art_path).await {
    Ok(data) => data,
    Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read image").into_response(),
  };

  let content_type = match cover_art_path.extension().and_then(|ext| ext.to_str()) {
    Some("jpg") | Some("jpeg") => "image/jpeg",
    Some("png") => "image/png",
    Some("gif") => "image/gif",
    Some("webp") => "image/webp",
    Some("bmp") => "image/bmp",
    Some("ico") => "image/x-icon",
    _ => "application/octet-stream", // fallback
  };

  (StatusCode::OK, [(header::CONTENT_TYPE, content_type)], image_data).into_response()
}

pub async fn stop_server() -> Result<(), String> {
  let mut handle = SERVER_HANDLE.lock().await;
  if let Some(server_handle) = handle.take() {
    server_handle.abort();
    Ok(())
  } else {
    Err("Server is not running".to_string())
  }
}