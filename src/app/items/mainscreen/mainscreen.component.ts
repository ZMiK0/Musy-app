import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";

@Component({
  selector: 'app-mainscreen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mainscreen.component.html',
  styleUrl: '../../../styles.css'
})
export class MainScreenComponent {

}