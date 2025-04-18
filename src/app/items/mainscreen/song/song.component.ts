import { Component, Input } from '@angular/core';
import { readFile } from '@tauri-apps/plugin-fs';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [],
  templateUrl: './song.component.html',
  styleUrl: '../../../../styles.css'
})
export class SongComponent {

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

    return URL.createObjectURL(blob);

  }

}
