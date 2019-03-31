import { TestBed } from '@angular/core/testing';

import { ActionService } from './action.service';
import { instance, mock } from 'ts-mockito';

describe('ActionService', () => {
  const actionServiceMock: ActionService = mock(ActionService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: ActionService, useValue: instance(actionServiceMock)}
    ]
  }));

  it('should be created', () => {
    const service: ActionService = TestBed.get(ActionService);
    expect(service).toBeTruthy();
  });
});
