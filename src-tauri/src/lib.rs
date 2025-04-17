use std::path::PathBuf;

use logic::sync;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_fs::FsExt;

mod logic;

#[tauri::command(rename_all = "snake_case")]
async fn sync_lib(music_dir:String, app_data_dir:String) {
    let _ = sync(PathBuf::from(app_data_dir),PathBuf::from(music_dir));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let scope = app.fs_scope();
            if let Err(e) = scope.allow_directory("$HOME/Music", true) {
                eprintln!("Failed access: {}", e)
            }
            if let Err(e) = scope.allow_directory("$APPDATA", true) {
                eprintln!("Failed access: {}", e)
            }
            if let Err(e) = scope.allow_directory("$HOME/.config", true) {
                eprintln!("Failed access: {}", e)
            }
            if let Err(e) = scope.allow_directory("$HOME/Library/Application Support", true) {
                eprintln!("Failed access: {}", e)
            }
            if let Err(e) = scope.allow_directory("src-tauri", true) {
                eprintln!("Failed access: {}", e)
            }
            
            Ok(())
         })
        .invoke_handler(tauri::generate_handler![sync_lib])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
