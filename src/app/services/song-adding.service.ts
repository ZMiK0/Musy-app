import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { readFile } from '@tauri-apps/plugin-fs';

@Injectable({
  providedIn: 'root'
})
export class SongAddingService {
  playlists: Playlist[] = []
  coverPath = 'assets/black.jpg';

  constructor() { }

  async getAllPlaylists() {
    const data_dir = await appDataDir();
    try {
      this.playlists = await invoke<Playlist[]>('get_all_playlists', {db_path: data_dir});
    } catch (error) {
      console.error('Error fetching playlists:', error);
      this.playlists = [];
    }
  }


  letGo() {
    this.playlists = [];
  }


}

interface Playlist {
  id: number;
  name: string;
  creation_date: string;
  cover_path: string;
  isStarred: boolean;
}