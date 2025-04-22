import { Component, Input } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { SongSendingService } from '../../../services/song-sending.service';
import { CommonModule } from '@angular/common';
import { SongAddingService } from '../../../services/song-adding.service';
import { PlaylistComponent } from "../playlist-button/playlist/playlist.component";
import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [CommonModule, PlaylistComponent],
  templateUrl: './song.component.html',
  styleUrl: '../../../../styles.css'
})
export class SongComponent {
  isModalOpen: boolean = false;

  constructor (public songSending:SongSendingService, public songAdding:SongAddingService) {}

  @Input() id!: string;
  @Input() path!: string;
  @Input() title!: string;
  @Input() artist!: string;
  @Input() album!: string;
  @Input() year!: string;
  @Input() duration!: string;
  @Input() coverPath!: string;
  @Input() isStarred!: boolean;

  @Input() playlistId!: number;

  coverUrl: string = 'assets/black.jpg';

  async ngOnInit() {
    this.coverUrl = await this.getCoverPath();
  }

  async getCoverPath(): Promise<string> {
    if (!this.coverPath) return 'assets/black.jpg';
    console.log("Hola")

    const fileData = await readFile(this.coverPath);
    
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    if (this.coverUrl) {
      URL.revokeObjectURL(this.coverUrl);
    }

    return URL.createObjectURL(blob);

  }

  playSong() {
    this.songSending.setSong(this.path,this.title,this.artist,this.coverUrl)
    console.log("Sending song: " + this.path);
  }

  addSongToQueue() {

  }

  addSongToPlaylist() {
    this.songAdding.getAllPlaylists();
    this.isModalOpen = true;
  }

  async removeSongFromPlaylist() {
    const data_dir = await appDataDir();
    invoke('remove_song_from_playlist', {playlist_id: this.playlistId, song_id: this.id, db_path: data_dir})
    console.log("Canción Eliminada: " + this.id + " en: " + this.playlistId)
  }

  close() {
    this.isModalOpen = false;
    this.songAdding.letGo();
  }

}
