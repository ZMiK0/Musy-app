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

  constructor (public mainScreenStatus:MainScreenStatusService, public songManagement:SongManagementService) {}

  setHome() {
    this.mainScreenStatus.setHome();
  }

  async reloadPlaylist() {
    const music_dir = await audioDir();
    const data_dir = await appDataDir();
    console.log(music_dir)
    console.log(data_dir)
    await invoke('sync_lib', {music_dir: '/home/belz/Música', app_data_dir: '/home/belz/.local/share/com.tfg-mp.app'})
  }
}