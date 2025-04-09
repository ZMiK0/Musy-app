import { TestBed } from '@angular/core/testing';

import { MainScreenStatusService } from './main-screen-status.service';

describe('MainScreenStatusService', () => {
  let service: MainScreenStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainScreenStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
