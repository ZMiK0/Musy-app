import { Component, OnInit } from '@angular/core';
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
  volume = 0;

  isPlaying = false;


  //!-PRUEBAS
  song = new Audio("../../../assets/TornadoOfSouls.mp3"); //! Ya no funciona, en el futuro esto estará llevado por una base de datos y rust asi que np

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.progress = (parseInt(input.value) / parseInt(input.max)) * 100;
  }

  onVolume(event: Event) {
    const inputVolume = event.target as HTMLInputElement;
    this.volume = (parseInt(inputVolume.value) / parseInt(inputVolume.max)) * 100
  }

  async initAudio() {
    this.song.load()
  }

  async onPlay() {

    if (!this.song) await this.initAudio();

    if (!this.isPlaying) {
      this.song.play()
      console.log("Cancion iniciada")
    } else {
      this.song.pause()
      console.log("Cancion pausada")
    }
    this.isPlaying = !this.isPlaying;
  }


}