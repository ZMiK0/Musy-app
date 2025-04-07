import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { exists, BaseDirectory, readFile } from '@tauri-apps/plugin-fs';
import { audioDir } from '@tauri-apps/api/path';


@Component({
  selector: 'app-playbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playbar.component.html',
  styleUrl: '../../../styles.css'
})
export class PlaybarComponent {
  song: HTMLAudioElement | null = null
  currentTime = 0
  progress = 0;
  volume = 0;

  isPlaying = false;
  path = ""

  async selectSong() {
    try {
      const musicDir = await audioDir();
      const path = `${musicDir}/TornadoOfSouls.mp3`;
      
      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      this.song = new Audio(audioUrl);
      
      //*Updatea el progreso de la barra
      this.song.addEventListener('timeupdate', () => {
        if (this.song) {
          this.progress = (this.song.currentTime / this.song.duration) * 100;
          this.currentTime = this.song.currentTime;
        }
      });
      
      this.song.addEventListener('ended', () => {
        this.isPlaying = false;
      });
      
      console.log('Canción cargada correctamente');
    } catch (error) {
      console.error('Error al cargar la canción:', error);
    }
  }

  //* La idea general es que. Se llama a mostrar canciones, y se mapea la base de datos asignando nombres imagenes, etc. Cuando se clicka en una cancion ese nombre se usa para encontrar el path para que lo pille el Audio(). Es decir, el backend unicamente gestiona la base de datos y retorna el array de la playlist OH DIOS MIO HE VUELTO AL PASO 1

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newTime = parseInt(input.value);
    if (this.song) {
      this.song.currentTime = newTime;
    }
  }

  onVolume(event: Event) {
    const inputVolume = event.target as HTMLInputElement;
    const newVolume = parseInt(inputVolume.value) / 100;
    if (this.song) {
      this.song.volume = newVolume;
    }
    this.volume = parseInt(inputVolume.value);
  }


  async onPlay() {
    
    if (!this.song) await this.selectSong();
    if (!this.song) return;

    if (!this.isPlaying) {
      this.song.play().then(() => console.log("Reproduciendo música..."))
      .catch(err => console.error("Error al reproducir:", err))
      console.log("Cancion iniciada")
    } else {
      this.song.pause()
      console.log("Cancion pausada")
    }
    this.isPlaying = !this.isPlaying;
  }

  formatTime(seconds: number | undefined): string {
    if (seconds === undefined || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    // Asegura que los segundos siempre tengan 2 dígitos
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
    
    return `${minutes}:${paddedSeconds}`;
  }

}