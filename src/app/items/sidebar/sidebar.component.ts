import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { ButtonComponent } from "./playlist-button/button.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { audioDir, appDataDir } from '@tauri-apps/api/path';
import { SongManagementService } from '../../services/song-management.service';
import { ModalService } from '../../services/modal.service';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../styles.css'
})
export class SidebarComponent {
  playlists: Playlist[] = []

  constructor (public mainScreenStatus:MainScreenStatusService, public songManagement:SongManagementService, public modal:ModalService ) {}

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

  newPlaylist() {
    this.modal.isOpen = true;
  }

  async onInput(event: Event) {
    this.modal.onInput(event)
  }

  async createThumbnail(blob: Blob, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(
                maxWidth / img.width,
                maxHeight / img.height
            );
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((thumbnailBlob) => {
                resolve(thumbnailBlob!);
            }, 'image/jpeg', 0.7);
        };
        img.src = URL.createObjectURL(blob);
    });
}

  async selectCover() {
    const file = await open({
      multiple: false,
      directory: false,
    });

    if(file == null) {
      return
    }

    const fileData = await readFile(file);
    
    const ogBlob = new Blob([fileData], { type: 'image/*' });

    const thumbnailBlob = await this.createThumbnail(ogBlob, 200, 200);

    if (this.modal.coverPath) {
      URL.revokeObjectURL(this.modal.coverPath);
    }

    this.modal.coverPath = URL.createObjectURL(thumbnailBlob);
  }

  async createPlaylist() {
    const data_dir = await appDataDir();
    invoke('create_playlist', {name: this.modal.name, cover_path: this.modal.coverPath, db_path: data_dir})
    console.log("Playlist creada")
    this.close()
    this.playlists = await this.getAllPlaylists();
    this.modal.coverPath = "assets/black.jpg"
  }

  close() {
    this.modal.isOpen = false
  }
  
}

interface Playlist {
  id: number;
  name: string;
  creation_date: string;
  cover_path: string;
  isStarred: boolean;
}