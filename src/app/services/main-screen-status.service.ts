import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainScreenStatusService {
  onHome = signal(true);

  constructor() { }

  setHome() {
    this.onHome.set(true);
  }

  setPlaylist() {
    this.onHome.set(false);
  }

}
