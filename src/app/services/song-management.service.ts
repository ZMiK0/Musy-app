import { Injectable } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { audioDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root'
})
export class SongManagementService {
  songCover:string = ""
  songTitle:string = ""
  songArtist:string = ""

  constructor() { this.setupSongListeners() }

  song: HTMLAudioElement = new Audio();
  
  getSong() {
    return this.song;
  }

  progress:number = 0;

  getProgress() {
    return this.progress;
  }

  volume:number = 0;

  isPlaying:boolean = false;

  loopMode:string = "none" //* none - playlist - single
  shuffle:boolean = false

  queue:Song[] = [] //!Aqui lo que se va a reproducir, y no es una queue de verdad ES UNA LISTA (no implementar funciones de queue)
  queueSave:Song[] = []
  currentIndex:number = 0
  currentIndexSave:number = 0
  currentISDelay:number = 0

  private async setupSongListeners() {
    this.song?.addEventListener('ended', () => this.playNext());
    this.song?.addEventListener('timeupdate', () => {
      if (this.song) {
        this.progress = (this.song.currentTime / this.song.duration) * 100;
      }
    });
  }



  setQueue(songs:Song[]) {
    this.queue = [...songs];
    this.currentIndex = 0;
    this.loadAndPlay(this.queue[0].path, 0);
  }

  addQueue(songs: Song[]) {
    this.queue.push(...songs)
  }

  setOneSong(song:Song) {
    this.queue = [];
    this.queue.push(song);
    this.currentIndex = 0;
    this.loadAndPlay(this.queue[0].path, 0);
  }

  addOneSong(song:Song) {
    this.queue.push(song);
  }

  async getCoverPath(coverPath:string): Promise<string> {
    let coverUrl: string = 'assets/black.jpg';
    if (!coverPath) return coverUrl;
    console.log("Hola")

    const fileData = await readFile(coverPath);
    
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    if (coverUrl) {
      URL.revokeObjectURL(coverUrl);
    }

    return URL.createObjectURL(blob);

  }

  async loadAndPlay(_path:string, _index:number) {
    try {
      this.songTitle = this.queue[_index].title;
      this.songArtist = this.queue[_index].artist;
      
      this.songCover = await this.getCoverPath(this.queue[_index].coverPath);

      const path = _path;
      
      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      this.song.src = audioUrl;
      await this.song.play();
      this.isPlaying = true;
      
      console.log('Canción cargada correctamente');
    } catch (error) {
      console.error('Error al cargar la canción:', error);
    }
  }

  async togglePlayPause() {
    if(!this.isPlaying) {
      this.song.play()
    } else {
      this.song.pause()
    }
    this.isPlaying = !this.isPlaying;
  }

  playNext() {
    if ((this.currentIndex < this.queue.length - 1) && (this.loopMode == "none" || this.loopMode == "playlist")) {
      this.currentIndex++;
      this.currentISDelay++;
      this.loadAndPlay(this.queue[this.currentIndex].path, this.currentIndex);
    } else if ((this.currentIndex == this.queue.length - 1) && this.loopMode == "playlist") {
      this.currentIndex = 0;
      this.loadAndPlay(this.queue[this.currentIndex].path, this.currentIndex);
    } else if (this.loopMode == "single") {
      this.song.currentTime = 0
    } else {
      this.stop();
    }
    console.log("CurrentIndex: " + this.currentIndex + " CurrentIndexSave: " + this.currentIndexSave)
  }

  playPrevious() {
    if(this.song.currentTime < 3) {
      if((this.currentIndex > 0) && this.loopMode != "single") {
        this.currentIndex--;
        this.currentISDelay--;
        this.loadAndPlay(this.queue[this.currentIndex].path, this.currentIndex);
      } else if (this.currentIndex == 0) {
        if (this.loopMode == "playlist") {
          this.currentIndex = this.queue.length - 1
          this.loadAndPlay(this.queue[this.currentIndex].path, this.currentIndex);
        } else if(this.loopMode == "single") {
          this.song.currentTime = 0
        } else {
          this.stop()
        }
      } else {
        this.song.currentTime = 0
      }
    } else {
      this.song.currentTime = 0
    }
  }

  stop() {
    this.song.pause();
    this.song.currentTime = 0;
    this.isPlaying = false;
  }

  isItPlaying() {
    return this.isPlaying;
  }

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
    switch (this.loopMode) {
      case "none":
        this.loopMode = "playlist";
        break;
      case "playlist":
        this.loopMode = "single";
        break;
      case "single":
        this.loopMode = "none";
        break;
      default:
        this.loopMode = "none";
        break;
    }
    return this.loopMode;
  }

  toggleShuffle() {
    if(!this.shuffle) {
      this.queueSave = [...this.queue];
      this.currentIndexSave = this.currentIndex;
      this.doShuffle();
    } else if(this.shuffle) {
      this.currentIndex = this.queueSave.indexOf(this.queue[this.currentIndex]);
      this.queue = this.queueSave;
    }
    this.shuffle = !this.shuffle;
    return this.shuffle;
  }

  doShuffle() {
    this.queue.unshift(this.queue[this.currentIndex])
    this.queue.splice(this.currentIndex+1,1)
    this.currentIndex = 0
    let firstElement = this.queue[0]
    let queueToShuffle = this.queue.splice(1);
    let currentIndex2 = queueToShuffle.length;

    while (currentIndex2 != 0) {

      let randomIndex = Math.floor(Math.random() * currentIndex2);
      currentIndex2--;

      [queueToShuffle[currentIndex2], queueToShuffle[randomIndex]] = [queueToShuffle[randomIndex], queueToShuffle[currentIndex2]];
    }
    queueToShuffle.unshift(firstElement)
    this.queue = queueToShuffle
    
  }

}

interface Song {
  id:string,
  path:string,
  title:string,
  artist:string,
  album:string,
  year:string,
  duration:string,
  coverPath:string,
  isStarred:boolean
}
