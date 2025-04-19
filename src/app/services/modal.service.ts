import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = false
  name = ""
  coverPath: string = "assets/black.jpg"

  constructor() { }

  onInput(event:Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value;
    this.name = newName;
    console.log(this.name)
  }

}