use crate::formatter::create_connection_string;
use crate::models::Library;

pub fn ping_server(library: Library) -> bool {
    let conn_string = create_connection_string(library, "ping");
    true
}
