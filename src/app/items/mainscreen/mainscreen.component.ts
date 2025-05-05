import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { SongComponent } from "./song/song.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { HomeitemComponent } from "./homeitem/homeitem.component";
import { appDataDir } from '@tauri-apps/api/path';

@Component({
  selector: 'app-mainscreen',
  standalone: true,
  imports: [CommonModule, SongComponent, HomeitemComponent],
  templateUrl: './mainscreen.component.html',
  styleUrl: '../../../styles.css'
})
export class MainScreenComponent {
  
  constructor (public mainScreenStatus:MainScreenStatusService) {}
  
}

