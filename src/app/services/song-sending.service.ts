import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SongSendingService {

  constructor() { }
  song_path:string = "default"

  setSong(song:string) {
    this.song_path = song
    console.log("Song set!")
  }
  
  getSong() {
    console.log("Song got!")
    return this.song_path;
  }
}
