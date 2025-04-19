import { Component, Input } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { SongSendingService } from '../../../services/song-sending.service';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [],
  templateUrl: './song.component.html',
  styleUrl: '../../../../styles.css'
})
export class SongComponent {

  constructor (public songSending:SongSendingService) {}

  @Input() id!: string;
  @Input() path!: string;
  @Input() title!: string;
  @Input() artist!: string;
  @Input() album!: string;
  @Input() year!: string;
  @Input() duration!: string;
  @Input() coverPath!: string;
  @Input() isStarred!: boolean;

  coverUrl: string = 'assets/black.jpg';

  async ngOnInit() {
    this.coverUrl = await this.getCoverPath();
    console.log(this.coverUrl)
  }

  async getCoverPath(): Promise<string> {
    if (!this.coverPath) return 'assets/black.jpg';
    console.log("Hola")

    const fileData = await readFile(this.coverPath);
    
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    if (this.coverUrl) {
      URL.revokeObjectURL(this.coverUrl);
    }

    return URL.createObjectURL(blob);

  }

  playSong() {
    this.songSending.setSong(this.path,this.title,this.artist,this.coverUrl)
    console.log("Sending song: " + this.path);
  }

  addSongToQueue() {

  }

}
