use std::borrow::Cow;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use lofty::file::{AudioFile, TaggedFileExt};
use rusqlite::{Connection, Result};
use walkdir::{DirEntry, WalkDir};
use lofty::read_from_path;
use lofty::tag::Accessor;

const DEFAULT_BLACK_IMAGE: &[u8] = include_bytes!("../black.jpg");

fn create_dir(path:PathBuf) -> std::io::Result<()> {
    let new_path = path.join("covers");
    println!("{}",new_path.display());
    fs::create_dir_all(&new_path).expect("Error");
    Ok(())
}

fn create_db(path:PathBuf) -> std::io::Result<()> {
    let conn = Connection::open(path.join("playlists.db")).expect("Error");
    conn.execute("create table if not exists all_songs(
        id text primary key not null,
        path text not null,
        title text not null,
        artist text,
        album text,
        year text,
        duration text,
        cover_path text,
        isStarred boolean default false
    );",()).expect("ERROR2");

    conn.execute("create table if not exists playlists (
        id integer primary key autoincrement,
        name text not null unique,
        creation_date DATE default CURRENT_DATE,
        cover_path text default '',
        isStarred boolean default false
    )", ()).expect("ERROR3");

    conn.execute("create table if not exists song_playlist(
        playlist_id integer not null,
        song_id integer not null,
        foreign key (playlist_id) references playlists(id) ON DELETE CASCADE,
        foreign key (song_id) references all_songs(id) ON DELETE CASCADE,
        primary key (playlist_id, song_id)
    );",() ).expect("ERROR4");

conn.execute("INSERT OR REPLACE INTO playlists (id, name) VALUES (?1,?2);", (0,"All Songs",)).expect("ERROR WHILE INSERTING");


    Ok(())

}

fn create_cover(path:PathBuf, title:&str, image:Option<Vec<u8>>) -> std::io::Result<PathBuf> {

    let hash = blake3::hash(title.as_ref());
    let file_name = format!("{}.jpg",hash);
    let full_path = path.join(file_name);

    let image_data = image.unwrap_or_else(|| DEFAULT_BLACK_IMAGE.to_vec());

    let cover = File::create(&full_path);
    cover?.write_all(image_data.as_ref()).expect("ERROR writing");
    Ok(full_path)
}

fn walk_dir(path:PathBuf, data_path:PathBuf) -> std::io::Result<()> {
    for entry in WalkDir::new(&path).into_iter().filter_entry(|e| is_music(e)) {
        let entry = entry?;
        if entry.file_name().to_str().unwrap_or("").ends_with(".mp3") || entry.file_name().to_str().unwrap_or("").ends_with(".ogg") {
            println!("{}", entry.path().display());
            let data = extract_metadata(entry.path().to_str().unwrap(),data_path.join("covers"))?;
            insert_song(data_path.clone(), entry.path().to_string_lossy().to_string(), data.0, data.1, data.2, data.3, data.4, data.5);
        }
    }
    Ok(())
}

fn is_music(entry: &DirEntry) -> bool {
    entry.file_name().to_str().map(|s| {s.ends_with(".mp3") || s.ends_with(".ogg")}).unwrap_or(false) || entry.file_type().is_dir()
}

fn extract_metadata(path:&str, cover_path:PathBuf) -> std::io::Result<(String, String, String, String, u128, String)> {
    let tagged_file = read_from_path(path).expect("Error");
    let first_tag = tagged_file.first_tag();
    let title = first_tag.unwrap().title().unwrap().to_string();
    let artist = first_tag.unwrap().artist().unwrap_or(Cow::from("Unkown")).to_string();
    let album = first_tag.unwrap().album().unwrap_or(Cow::from("Unkown")).to_string();
    let year = first_tag.unwrap().year().unwrap_or(0000).to_string();
    let duration = tagged_file.properties().duration().as_millis();
    let cover = first_tag.unwrap().pictures().first().map(|p| p.data().to_vec() );

    println!("{}", title);
    println!("{}", artist);
    println!("{}", album);
    println!("{}", year);
    println!("{}", duration);
    let cover_path = create_cover(cover_path, &title, cover).expect("Error creating cover");
    println!("{}",cover_path.display());
    Ok((title,artist,album,year,duration,cover_path.to_string_lossy().to_string()))
}

fn insert_song(path:PathBuf , song_path:String, title:String, artist:String, album:String, year:String, duration: u128, cover_path:String) {
    let dur_secs = (duration / 1000) as i64;
    let new_duration = format!("{}:{:02}",dur_secs / 60, dur_secs % 60);
    let uuid = blake3::hash(title.as_ref());

    let conn = Connection::open(path.join("playlists.db")).expect("Error");
    conn.execute("INSERT OR REPLACE INTO all_songs (id, path, title, artist, album, year, duration, cover_path) VALUES (?1,?2,?3,?4,?5,?6,?7,?8);", (uuid.to_string(), song_path, title, artist, album, year, new_duration, cover_path)).expect("ERROR WHILE INSERTING");
}

pub fn sync(path:PathBuf, music_path:PathBuf) -> std::io::Result<()> {
    create_db(path.clone())?;
    create_dir(path.clone())?;
    clean(path.clone()).unwrap();
    walk_dir(music_path, path.clone())?;

    Ok(())
}

fn clean(database_path: PathBuf) -> Result<()> {
    let conn = Connection::open(database_path.join("playlists.db"))?;
    let mut conn2 = Connection::open(database_path.join("playlists.db"))?;
    let mut stmt = conn.prepare("SELECT id, path FROM all_songs")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;

    let tx = conn2.transaction()?;

    for row in rows {
        let (id, path_str) = row?;
        let path = Path::new(&path_str);

        if !path.exists() {
            println!("Removing song: {} - File not found: {}", id, path_str);
            tx.execute("DELETE FROM all_songs WHERE id = ?",[id])?;
        }
    };

    tx.commit()?;
    println!("Operation completed.");
    Ok(())

}

pub fn create_playlist(name:String, cover_path:String, db_path:String) -> Result<()> {
    let conn = Connection::open(PathBuf::from(db_path))?;

    conn.execute("INSERT INTO playlists (name, cover_path) VALUES (?1, ?2);", (name, cover_path)).expect("ERROR WHILE INSERTING");

    Ok(())
}

pub fn add_song_to_playlist(playlist_id:i64, song_id:i64, db_path:String) -> Result<()> {
    let conn = Connection::open(PathBuf::from(db_path))?;

    conn.execute("INSERT INTO song_playlist (playlist_id, song_id) VALUES (?1,?2);",(playlist_id, song_id)).expect("ERROR WHILE INSERTING SONG");

    Ok(())
}

#[derive(serde::Serialize)]
pub struct Playlist {
    id: i64,
    name: String,
    creation_date: String,
    cover_path: String,
    #[serde(rename = "isStarred")]
    is_starred: bool,
}

#[derive(serde::Serialize)]
pub struct Song {
    id: String,
    path: String,
    title: String,
    artist: String,
    album: String,
    year: String,
    duration: String,
    #[serde(rename = "coverPath")]
    cover_path: String,
    #[serde(rename = "isStarred")]
    is_starred: bool,
}

pub fn get_all_playlists(db_path:String) -> Result<Vec<Playlist>, String> {
    let conn = Connection::open(PathBuf::from(db_path).join("playlists.db")).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare("SELECT id, name, creation_date, cover_path, isStarred FROM playlists").map_err(|e| e.to_string())?;

    let playlists = stmt.query_map([], |row| {
        Ok(Playlist {
            id: row.get(0)?,
            name: row.get(1)?,
            creation_date: row.get(2)?,
            cover_path: row.get(3)?,
            is_starred: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(playlists)
}

pub fn get_all_songs(db_path:String) -> Result<Vec<Song>, String> {
    let conn = Connection::open(PathBuf::from(db_path).join("playlists.db")).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare("SELECT id, path, title, artist, album, year, duration, cover_path, isStarred FROM all_songs").map_err(|e| e.to_string())?;

    let all_songs = stmt.query_map([], |row| {
        Ok(Song {
            id: row.get(0)?,
            path: row.get(1)?,
            title: row.get(2)?,
            artist: row.get(3)?,
            album: row.get(4)?,
            year: row.get(5)?,
            duration: row.get(6)?,
            cover_path: row.get(7)?,
            is_starred: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(all_songs)

}