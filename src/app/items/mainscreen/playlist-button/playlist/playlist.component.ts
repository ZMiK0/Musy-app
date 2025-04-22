import { Component, Input } from '@angular/core';
import { MainScreenStatusService } from '../../../../services/main-screen-status.service';
import { readFile } from '@tauri-apps/plugin-fs';
import { CommonModule } from '@angular/common';
import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist.component.html',
  styleUrl: '../../../../../styles.css'
})
export class PlaylistComponent {
  coverPath = 'assets/black.jpg';

  constructor (public mainScreenStatus:MainScreenStatusService) {}

  @Input() playlistId!: number;

  @Input() playlistName!: string;

  @Input() playlistCoverPath!: string;

  @Input() songId!: string;

  async ngOnInit() {
    this.coverPath = await this.getCoverPath();
  }

  async getCoverPath(): Promise<string> {
    if (!this.coverPath) return 'assets/black.jpg';

    const fileData = await readFile(this.playlistCoverPath);
    
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    if (this.coverPath) {
      URL.revokeObjectURL(this.coverPath);
    }

    return URL.createObjectURL(blob);
  }

  async addSongToPlaylist() {
    const data_dir = await appDataDir();
    invoke('add_song_to_playlist', {playlist_id: this.playlistId, song_id: this.songId, db_path: data_dir})
    console.log("Canción añadida: " + this.songId + " en: " + this.playlistName)
  }
}
