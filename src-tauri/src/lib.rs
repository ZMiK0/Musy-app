// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_fs::FsExt;
use walkdir::WalkDir;

#[tauri::command]
fn get_music_dir(path: String) -> Vec<String> {
    let mut songs_path: Vec<String> = Vec::new();
    
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let path_str = entry.path().display().to_string();
            println!("{}", path_str);
            songs_path.push(path_str);
        }
    }
    
    songs_path
}

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
        .invoke_handler(tauri::generate_handler![get_music_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
