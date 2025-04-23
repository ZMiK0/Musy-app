import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { SongManagementService } from './song-management.service';
import { readFile } from '@tauri-apps/plugin-fs';

@Injectable({
  providedIn: 'root'
})
export class MainScreenStatusService {
  onHome = signal(true);
  pId: number = 0;
  pName: string = "";
  pDate: string = "";
  pCoverPath: string = "";
  pStarred: boolean = false;

  songs:Song[] = []
  songsCover:string[] = []

  constructor(public songManagement:SongManagementService) { }

  setHome() {
    this.onHome.set(true);
    this.pId = 0;
    this.pName = "";
    this.pDate = "";
    this.pCoverPath = "";
  }

  setPlaylist(id:number, name:string, date:string, coverPath:string, isStarred:boolean) {
    this.onHome.set(false);
    this.pId = id;
    this.pName = name;
    this.pDate = date;
    this.pCoverPath = coverPath;
    this.pStarred = isStarred;
  }

  /*
  async getAllSongs() { //! El bucle for hace que sea muy lento y se vea como se cargan las imagenes
    const data_dir = await appDataDir();
    try {
      this.songs = await invoke<Song[]>('get_all_songs', {db_path: data_dir});
      this.songs = await Promise.all(this.songs.map(async song => {
        if (!song.coverPath) song.coverPath = 'assets/black.jpg';
        
        try {
            const fileData = await readFile(song.coverPath);
            const blob = new Blob([fileData], { type: 'image/jpeg' });
            song.coverPath = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading cover:', error);
            song.coverPath = 'assets/black.jpg';
        }
        
        return song;
    }));
    } catch (error) {
      console.error('Error fetching songs:', error);
      this.songs = [];
    }

  }

  async getPlaylistSongs() { //! El bucle for hace que sea muy lento y se vea como se cargan las imagenes
    const data_dir = await appDataDir();
    try {
      this.songs = await invoke<Song[]>('get_playlist_songs', {playlist_id: this.pId, db_path: data_dir});
      this.songs = await Promise.all(this.songs.map(async song => {
        if (!song.coverPath) song.coverPath = 'assets/black.jpg';
        
        try {
            const fileData = await readFile(song.coverPath);
            const blob = new Blob([fileData], { type: 'image/jpeg' });
            song.coverPath = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading cover:', error);
            song.coverPath = 'assets/black.jpg';
        }
        
        return song;
      }));
    } catch (error) {
      console.error('Error fetching songs:', error);
      this.songs = [];
    }
  }
  */

  async getAllSongs() {
    const data_dir = await appDataDir();
    try {
      this.songs = await invoke<Song[]>('get_all_songs', {db_path: data_dir});
    } catch (error) {
      console.error('Error fetching songs:', error);
      this.songs = [];
    }

  }

  async getPlaylistSongs() {
    const data_dir = await appDataDir();
    try {
      this.songs = await invoke<Song[]>('get_playlist_songs', {playlist_id: this.pId, db_path: data_dir});
    } catch (error) {
      console.error('Error fetching songs:', error);
      this.songs = [];
    }
  }

  async refresh() {
    await this.getPlaylistSongs();
  }

  playQueue() {
    this.songManagement.setQueue(this.songs);
  }

  addQueue() {
    this.songManagement.addQueue(this.songs);
  }

}

interface Song {
  id:string,
  path:string,
  title:string,
  artist:string,
  album:string,
  year:string,
  duration:string,
  coverPath:string,
  isStarred:boolean
}