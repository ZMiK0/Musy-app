import { Component, Input } from '@angular/core';
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
  isAllSongs: boolean = false;

  constructor (public mainScreenStatus:MainScreenStatusService) {}

  @Input() playlistId!: string;

  @Input() playlistName!: string;

  @Input() playlistDate!: string;

  @Input() playlistCoverPath!: string;

  @Input() playlistIsStarred!: boolean;


  setPlaylistOnMainScreen() {
    this.mainScreenStatus.setPlaylist(this.playlistId, this.playlistName, this.playlistDate, this.playlistCoverPath, this.playlistIsStarred);
    this.mainScreenStatus.getAllSongs()
  }
}