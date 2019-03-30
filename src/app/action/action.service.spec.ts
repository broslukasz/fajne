import { TestBed } from '@angular/core/testing';

import { ActionService } from './action.service';
import { instance, mock } from 'ts-mockito';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';

describe('ActionService', () => {
  const actionServiceMock: ActionService = mock(ActionService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: ActionService, useValue: instance(actionServiceMock)},
      {provide: FirabaseStateCommunicationService, useValue: instance(mock(FirabaseStateCommunicationService))}
    ]
  }));

  it('should be created', () => {
    const service: ActionService = TestBed.get(ActionService);
    expect(service).toBeTruthy();
  });
});
