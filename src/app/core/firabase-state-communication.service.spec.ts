import { TestBed } from '@angular/core/testing';

import { FirabaseStateCommunicationService } from './firabase-state-communication.service';
import { instance, mock } from 'ts-mockito';

describe('FirabaseStateCommunicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: FirabaseStateCommunicationService, useValue: instance(mock(FirabaseStateCommunicationService))}
    ]
  }));

  it('should be created', () => {
    const service: FirabaseStateCommunicationService = TestBed.get(FirabaseStateCommunicationService);
    expect(service).toBeTruthy();
  });
});
