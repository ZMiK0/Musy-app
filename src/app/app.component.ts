import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { SidebarComponent } from "./items/sidebar/sidebar.component";
import { MainScreenComponent } from "./items/mainscreen/mainscreen.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MainScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: '../styles.css'
})
export class AppComponent {
  
}
