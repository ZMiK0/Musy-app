import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';

@Injectable({
  providedIn: 'root'
})
export class MainScreenStatusService {
  onHome = signal(true);
  pId: string = "";
  pName: string = "";
  pDate: string = "";
  pCoverPath: string = "";
  pStarred: boolean = false;

  songs:Song[] = []

  constructor() { }

  setHome() {
    this.onHome.set(true);
    this.pId = "";
    this.pName = "";
    this.pDate = "";
    this.pCoverPath = "";
  }

  setPlaylist(id:string, name:string, date:string, coverPath:string, isStarred:boolean) {
    this.onHome.set(false);
    this.pId = id;
    this.pName = name;
    this.pDate = date;
    this.pCoverPath = coverPath;
    this.pStarred = isStarred;
  }

  async getAllSongs() {
    const data_dir = await appDataDir();
    try {
      this.songs = await invoke<Song[]>('get_all_songs', {db_path: data_dir});
      //console.log(this.songs[0].coverPath)
    } catch (error) {
      console.error('Error fetching songs:', error);
      this.songs = [];
    }

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