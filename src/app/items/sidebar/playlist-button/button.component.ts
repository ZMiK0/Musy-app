import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { MainScreenStatusService } from '../../../services/main-screen-status.service';

@Component({
  selector: 'app-playlist-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: '../../../../styles.css'
})
export class ButtonComponent {
  constructor (public mainScreenStatus:MainScreenStatusService) {}

  setPlaylistOnMainScreen() {
    this.mainScreenStatus.setPlaylist();
  }
}