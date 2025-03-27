import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: 'app-playbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playbar.component.html',
  styleUrl: '../../../styles.css'
})
export class PlaybarComponent {
  progress = 0; 

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.progress = (parseInt(input.value) / parseInt(input.max)) * 100;
  }
}