import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoke } from "@tauri-apps/api/core";
import { ButtonComponent } from "./playlist-button/button.component";
import { MainScreenStatusService } from '../../services/main-screen-status.service';
import { audioDir, appDataDir, join, BaseDirectory } from '@tauri-apps/api/path';
import { SongManagementService } from '../../services/song-management.service';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { mkdir } from '@tauri-apps/plugin-fs';
import { SongComponent } from '../mainscreen/song/song.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SongComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../styles.css'
})
export class SidebarComponent {
  playlists: Playlist[] = []
  name:string = ""
  isModalOpen:boolean = false;
  isModalOpenSearch:boolean = false;
  songs:Song[] = []
  coverPath: string = "assets/black.jpg"

  constructor (public mainScreenStatus:MainScreenStatusService, public songManagement:SongManagementService) {}

  async ngOnInit() {
    this.playlists = await this.getAllPlaylists();
  }

  setHome() {
    this.mainScreenStatus.setHome();
  }

  async reloadPlaylist() {
    const music_dir = await audioDir();
    const data_dir = await appDataDir();
    console.log(music_dir)
    console.log(data_dir)
    await invoke('sync_lib', {music_dir: music_dir, app_data_dir: data_dir})
    this.refresh()

  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const data_dir = await appDataDir();
    try {
      return await invoke<Playlist[]>('get_all_playlists', {db_path: data_dir});
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  newPlaylist() {
    this.isModalOpen = true;
  }

  close() {
    this.isModalOpen = false;
  }

  searchSong() {
    this.isModalOpenSearch = true;
    this.getAllSongs();
  }

  closeSearch() {
    this.isModalOpenSearch = false;
    this.songs = []
  }

  async onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value;
    this.name = newName;
    console.log(this.name)
  }

  async createThumbnail(blob: Blob, maxWidth: number, maxHeight: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(
                maxWidth / img.width,
                maxHeight / img.height
            );
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (thumbnailBlob) => {
                if (!thumbnailBlob) {
                    reject(new Error("Failed to create thumbnail blob"));
                    return;
                }
                
                try {
                    const arrayBuffer = await thumbnailBlob.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    resolve(uint8Array);
                } catch (error) {
                    reject(error);
                }
            }, 'image/jpeg', 0.7);
        };
        
        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };
        
        img.src = URL.createObjectURL(blob);
    });
  }

  async selectCover() {
    const file = await open({
      multiple: false,
      directory: false,
    });

    if(file == null) {
      return
    }

    const fileData = await readFile(file);
    const ogBlob = new Blob([fileData], { type: 'image/*' });
    const thumbnail = await this.createThumbnail(ogBlob, 200, 200);

    try {
      await mkdir('pcovers', { baseDir: BaseDirectory.AppData });
    } catch {
      console.log("Already Created")
    }
    

    let randomName = (Math.floor(Math.random() * (Math.floor(200000) - Math.ceil(1) + 1)) + Math.ceil(1)).toString();
    await writeFile(`pcovers/${randomName}.jpg`, thumbnail, {baseDir: BaseDirectory.AppData})

    const data_dir = await appDataDir();
    let newPath = data_dir + "/pcovers/" + randomName + ".jpg";
    console.log(newPath)

    this.coverPath = newPath;
  }

  async createPlaylist() {
    const data_dir = await appDataDir();
    invoke('create_playlist', {name: this.name, cover_path: this.coverPath, db_path: data_dir})
    console.log("Playlist creada")
    this.close()
    this.refresh()
    this.coverPath = "assets/black.jpg"
  }

  async refresh() {
    this.playlists = await this.getAllPlaylists();
  }

  async getAllSongs() {
      const data_dir = await appDataDir();
      try {
        this.songs = await invoke<Song[]>('get_all_songs', {db_path: data_dir});
      } catch (error) {
        console.error('Error fetching songs:', error);
        this.songs = [];
      }
  
    }
  
}

interface Playlist {
  id: number;
  name: string;
  creation_date: string;
  cover_path: string;
  isStarred: boolean;
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