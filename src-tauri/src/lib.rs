use std::path::PathBuf;
use logic::add_playlist;
use logic::add_song;
use logic::remove_song;
use tauri_plugin_fs::FsExt;

mod logic;
use logic::Playlist;
use logic::Song;

#[tauri::command(rename_all = "snake_case")]
async fn sync_lib(music_dir:String, app_data_dir:String) {
    let _ = logic::sync(PathBuf::from(app_data_dir),PathBuf::from(music_dir));
}


#[tauri::command(rename_all = "snake_case")]
async fn get_all_playlists(db_path:String) -> Result<Vec<Playlist>, String> {
    let playlists = logic::get_all_playlists(db_path)?;

    Ok(playlists)
}

#[tauri::command(rename_all = "snake_case")]
async fn get_all_songs(db_path:String) -> Result<Vec<Song>, String> {
    let all_songs = logic::get_all_songs(db_path)?;

    Ok(all_songs)
}

#[tauri::command(rename_all = "snake_case")]
async fn get_playlist_songs(playlist_id: i64, db_path: String) -> Result<Vec<Song>, String> {
    let playlist_songs = logic::get_playlist_songs(playlist_id, db_path)?;

    Ok(playlist_songs)
}

#[tauri::command(rename_all = "snake_case")]
async fn create_playlist(name:String, cover_path:String, db_path:String) {
    let _ = add_playlist(name, cover_path, db_path);
}

#[tauri::command(rename_all = "snake_case")]
async fn add_song_to_playlist(playlist_id:i64, song_id:String, db_path:String) {
    let _ = add_song(playlist_id, song_id, db_path);
}

#[tauri::command(rename_all = "snake_case")]
async fn remove_song_from_playlist(playlist_id:i64, song_id:String, db_path:String) {
    let _ = remove_song(playlist_id, song_id, db_path);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
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
        .invoke_handler(tauri::generate_handler![sync_lib, get_all_playlists, get_all_songs, get_playlist_songs,create_playlist, add_song_to_playlist, remove_song_from_playlist])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
