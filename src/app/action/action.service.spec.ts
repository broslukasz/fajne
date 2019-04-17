import { TestBed } from '@angular/core/testing';

import { ActionService } from './action.service';
import { instance, mock } from 'ts-mockito';
import { AuthService } from '../auth/auth.service';
import { ChartService } from './services/chart.service';

describe('ActionService', () => {
  const actionServiceMock: ActionService = mock(ActionService);
  const authServiceMock: AuthService = mock(AuthService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: ActionService, useValue: instance(actionServiceMock)},
      {provide: AuthService, useValue: instance(authServiceMock)}
    ]
  }));

  it('should be created', () => {
    const service: ActionService = TestBed.get(ActionService);
    expect(service).toBeTruthy();
  });
});
