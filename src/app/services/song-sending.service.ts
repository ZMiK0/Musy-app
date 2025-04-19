import { Injectable } from '@angular/core';
import { SongManagementService } from './song-management.service';

@Injectable({
  providedIn: 'root'
})
export class SongSendingService {

  constructor(public songManagement:SongManagementService) { }

  setSong(song:string, title:string, artist:string, coverPath:string) {
    this.songManagement.setOneSong(song, title, artist, coverPath)
    console.log("Song set!")
  }
  
}
