import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { instance, mock } from 'ts-mockito';
import { of } from 'rxjs';
import { ActionService } from '../action/action.service';

describe('AuthService', () => {
  let angularFireAuth: AngularFireAuth;
  const authServiceMock: ActionService = mock(ActionService);

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule
    ],
    providers: [
      {provide: AuthService, useValue: instance(authServiceMock)},
      {provide: AngularFireAuth, useValue: instance(mock(AngularFireAuth))}
    ]
  }));

  beforeEach(() => {
    angularFireAuth = TestBed.get(AngularFireAuth);
    (<any>angularFireAuth).authState = of({});
  });

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});
