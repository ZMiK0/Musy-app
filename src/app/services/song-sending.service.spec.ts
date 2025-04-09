import { TestBed } from '@angular/core/testing';

import { SongSendingService } from './song-sending.service';

describe('SongSendingService', () => {
  let service: SongSendingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongSendingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
