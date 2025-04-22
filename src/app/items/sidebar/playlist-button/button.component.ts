import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { MainScreenStatusService } from '../../../services/main-screen-status.service';
import { readFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

@Component({
  selector: 'app-playlist-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: '../../../../styles.css'
})
export class ButtonComponent {
  coverPath = 'assets/black.jpg';

  isDropDownOpen: boolean = false;

  constructor (public mainScreenStatus:MainScreenStatusService) {}

  @Input() playlistId!: number;

  @Input() playlistName!: string;

  @Input() playlistDate!: string;

  @Input() playlistCoverPath!: string;

  @Input() playlistIsStarred!: boolean;

  @Input() refreshFn!: () => void;

  async ngOnInit() {
    this.coverPath = await this.getCoverPath();
  }

  setPlaylistOnMainScreen() {
    this.mainScreenStatus.setPlaylist(this.playlistId, this.playlistName, this.playlistDate, this.coverPath, this.playlistIsStarred);
    if (this.playlistId == 0) {
      this.mainScreenStatus.getAllSongs()
    } else {
      this.mainScreenStatus.getPlaylistSongs()
    }
    
  }

  async getCoverPath(): Promise<string> {
    if (!this.coverPath) return 'assets/black.jpg';
    console.log("Hola")

    const fileData = await readFile(this.playlistCoverPath);
    
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    if (this.coverPath) {
      URL.revokeObjectURL(this.coverPath);
    }

    return URL.createObjectURL(blob);
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

  async removePlaylist() {
    const data_dir = await appDataDir();
    invoke('remove_playlist', {playlist_id: this.playlistId, db_path: data_dir});
    console.log("Playlist Eliminada: " + this.playlistId);
    this.refreshFn();
  }

}