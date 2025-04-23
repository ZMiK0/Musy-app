import { Component, HostListener, Input } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { SongSendingService } from '../../../services/song-sending.service';
import { CommonModule } from '@angular/common';
import { SongAddingService } from '../../../services/song-adding.service';
import { PlaylistComponent } from "../playlist-button/playlist/playlist.component";
import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { MainScreenStatusService } from '../../../services/main-screen-status.service';
import { SongManagementService } from '../../../services/song-management.service';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [CommonModule, PlaylistComponent],
  templateUrl: './song.component.html',
  styleUrl: '../../../../styles.css'
})
export class SongComponent {
  isModalOpen: boolean = false;

  isDropDownOpen: boolean = false;

  constructor (public songManagement:SongManagementService, public songAdding:SongAddingService, public mainScreenStatus:MainScreenStatusService) {}

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
  //this.path,this.title,this.artist,this.coverUrl
  playSong() {
    let song:Song = {id: this.id, path: this.path, title:this.title, artist: this.artist, album: this.album, year: this.year, duration: this.duration, coverPath: this.coverPath, isStarred: this.isStarred };
    this.songManagement.setOneSong(song);
  }

  addSongToQueue() {
    let song:Song = {id: this.id, path: this.path, title:this.title, artist: this.artist, album: this.album, year: this.year, duration: this.duration, coverPath: this.coverPath, isStarred: this.isStarred };
    this.songManagement.addOneSong(song);
  }

  addSongToPlaylist() {
    this.songAdding.getAllPlaylists();
    this.isModalOpen = true;
  }

  async removeSongFromPlaylist() {
    const data_dir = await appDataDir();
    invoke('remove_song_from_playlist', {playlist_id: this.playlistId, song_id: this.id, db_path: data_dir});
    console.log("Canción Eliminada: " + this.id + " en: " + this.playlistId);
    this.mainScreenStatus.refresh();
  }

  close() {
    this.isModalOpen = false;
    this.songAdding.letGo();
  }

  toggleDropDown() {
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  closeDropDown() {
    this.isDropDownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative.inline-block')) {
      this.closeDropDown();
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