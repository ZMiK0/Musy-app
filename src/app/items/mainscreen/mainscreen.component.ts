import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { SongSendingService } from '../../services/song-sending.service';
import { SongComponent } from "./song/song.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { HomeitemComponent } from "./homeitem/homeitem.component";

@Component({
  selector: 'app-mainscreen',
  standalone: true,
  imports: [CommonModule, SongComponent, HomeitemComponent],
  templateUrl: './mainscreen.component.html',
  styleUrl: '../../../styles.css'
})
export class MainScreenComponent {
  /**
  song="/home/belz/Música/DoItForHer.mp3"

  constructor(public songService:SongSendingService) {}

  sendSong() {
    this.songService.setSong(this.song)
    console.log("Song sent!")
  }
  */
  constructor (public mainScreenStatus:MainScreenStatusService) {}

}