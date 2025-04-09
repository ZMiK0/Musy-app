import { Injectable } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { audioDir } from '@tauri-apps/api/path';
import { SongSendingService } from './song-sending.service';

@Injectable({
  providedIn: 'root'
})
export class SongManagementService {

  constructor(public songService:SongSendingService) { }

  song: HTMLAudioElement | null = null
  
  getSong() {
    return this.song;
  }

  progress:number = 0;

  getProgress() {
    return this.progress;
  }

  volume:number = 0;

  isPlaying:boolean = false;

  loop_mode:string = "none" //* none - playlist - single
  shuffle:boolean = false

  playlist:string[] = ["/home/belz/Música/DoItForHer.mp3","/home/belz/Música/IntoTheSky.mp3","/home/belz/Música/TornadoOfSouls.mp3"] //!Aqui entra la playlist seleccionada, puede ser un query sql traido de rust (un invoke), este dato va a estar cambiando constantemente
  queue:string[] = [] //!Aqui lo que se va a reproducir, y no es una queue de verdad ES UNA LISTA (no implementar funciones de queue)
  current_song:string = "/home/belz/Música/IntoTheSky.mp3" //? Cuando se abre la app no hay ninguna cancion, es cuando se le da play a una playlist o a una cancion que esto cambia (Servicio para ello creado)

  addToQueue() {
    for (let i = 0; i < this.playlist.length; i++) {
      this.queue.push(this.playlist[i])
    }
  }

  async selectSong(_path:string) {
    try {
      const musicDir = await audioDir();
      const path = _path; //!Ejemplo, este path vendra de la base de datos
      
      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      this.song = new Audio(audioUrl);
      
      //*Updatea el progreso de la barra
      this.song.addEventListener('timeupdate', () => {
        if (this.song) {
          this.progress = (this.song.currentTime / this.song.duration) * 100;
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

  async onPlay() {
    
    if (!this.song) await this.selectSong(this.current_song);
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

  isItPlaying() {
    return this.isPlaying;
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
    return this.volume
  }

  formatTime(seconds: number | undefined): string {
    if (seconds === undefined || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    // Asegura que los segundos siempre tengan 2 dígitos
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
    
    return `${minutes}:${paddedSeconds}`;
  }

  cycleLoop() {
    switch (this.loop_mode) {
      case "none":
        this.loop_mode = "playlist";
        break;
      case "playlist":
        this.loop_mode = 'single';
        break;
      case "single":
        this.loop_mode = "none";
        break;
      default:
        this.loop_mode = "none";
        break;
    }
    return this.loop_mode;
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    return this.shuffle;
  }
}
