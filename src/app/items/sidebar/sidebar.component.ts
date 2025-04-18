import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { ButtonComponent } from "./playlist-button/button.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { audioDir, appDataDir } from '@tauri-apps/api/path';
import { SongManagementService } from '../../services/song-management.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../styles.css'
})
export class SidebarComponent {
  playlists: Playlist[] = []

  constructor (public mainScreenStatus:MainScreenStatusService, public songManagement:SongManagementService) {}

  async ngOnInit() {
    this.playlists = await this.getAllPlaylists();
  }

  setHome() {
    this.mainScreenStatus.setHome();
  }

  async reloadPlaylist() {
    const music_dir = await audioDir();
    const data_dir = await appDataDir();
    console.log(music_dir)
    console.log(data_dir)
    await invoke('sync_lib', {music_dir: music_dir, app_data_dir: data_dir})
    this.playlists = await this.getAllPlaylists();

  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const data_dir = await appDataDir();
    try {
      return await invoke<Playlist[]>('get_all_playlists', {db_path: data_dir});
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  getCoverPath(coverPath: string | null): string {
    return coverPath || 'assets/black.jpg';
  }

  
}

interface Playlist {
  id: number;
  name: string;
  creation_date: string;
  cover_path: string;
  isStarred: boolean;
}