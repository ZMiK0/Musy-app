import { TestBed } from '@angular/core/testing';

import { SongAddingService } from './song-adding.service';

describe('SongAddingService', () => {
  let service: SongAddingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongAddingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
