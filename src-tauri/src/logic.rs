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
    creation_date integer default (strftime('%s', 'now')),
    isStarred boolean default false
)", ()).expect("ERROR3");
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