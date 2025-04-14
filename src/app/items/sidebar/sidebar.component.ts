import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { ButtonComponent } from "./playlist-button/button.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { audioDir } from '@tauri-apps/api/path';
import { SongManagementService } from '../../services/song-management.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../styles.css'
})
export class SidebarComponent {

  constructor (public mainScreenStatus:MainScreenStatusService, public songManagement:SongManagementService) {}

  setHome() {
    this.mainScreenStatus.setHome();
  }

  async reloadPlaylist() {
    const musicDir = await audioDir();
    invoke('get_music_dir', { path:musicDir }).then((paths: unknown) => {
      const songPaths = paths as string[];
      this.songManagement.setQueue(songPaths);
    })
    .catch(error => {
      console.error('Error al cargar directorio:', error);
    });
  }
}