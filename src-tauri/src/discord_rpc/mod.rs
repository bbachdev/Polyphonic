use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::{sync::Mutex, time::{SystemTime, UNIX_EPOCH}};
use tauri::State;

use crate::models::DiscordActivity;

pub struct DiscordRpcState {
    client: Mutex<Option<DiscordIpcClient>>,
}

impl DiscordRpcState {
    pub fn new() -> Self {
        Self {
            client: Mutex::new(None),
        }
    }
}

pub async fn init_discord(state: State<'_, DiscordRpcState>) -> Result<(), String> {
    let mut client_guard = state.client.lock().map_err(|e| e.to_string())?;

    // Close existing client if any
    if let Some(ref mut existing_client) = *client_guard {
        let _ = existing_client.close();
    }

    //TODO: Get client ID from env
    let client_id = "1344388517849075742";

    let mut client = DiscordIpcClient::new(client_id).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| e.to_string())?;

    *client_guard = Some(client);
    Ok(())
}

pub async fn update_discord_activity(state: State<'_, DiscordRpcState>, activity_info: DiscordActivity) -> Result<(), String> {
    let mut client_guard = state.client.lock().map_err(|e| e.to_string())?;
    if let Some(ref mut client) = *client_guard {
        let _ = client.set_activity(activity::Activity::new().state(&activity_info.state).details(&activity_info.details).
        assets(activity::Assets::new().large_image(&activity_info.large_image_key).large_text(&activity_info.large_image_text))
        .timestamps(activity::Timestamps::new().start(SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis().try_into().unwrap())).activity_type(activity::ActivityType::Listening));
    }
    Ok(())
}