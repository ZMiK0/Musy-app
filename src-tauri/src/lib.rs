// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_fs::FsExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let scope = app.fs_scope();
            if let Err(e) = scope.allow_directory("$HOME/Music", true) {
                eprintln!("Fallo al acceder al directorio: {}", e)
            }
            
            Ok(())
         })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
