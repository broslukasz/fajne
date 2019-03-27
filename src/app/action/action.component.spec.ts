import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import { ActionComponent } from './action.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { AuthService } from '../auth/auth.service';
import {configureTestSuite} from '../tests/utils/configure-test.suite.spec';
import {ActionService} from './services/action.service';

describe('ActionComponent', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;

  const angularFireDatabaseMock: AngularFireDatabase = mock(AngularFireDatabase);
  const actionServiceMock: ActionService = mock(ActionService);

  when(angularFireDatabaseMock.object(anything())).thenReturn(
    <any>{
      valueChanges: () => of({})
    }
  );

  configureTestSuite();

  beforeAll(done => (async () => {

    TestBed.configureTestingModule({
      declarations: [ ActionComponent ],
      providers: [
        {provide: AngularFireDatabase, useValue: instance(angularFireDatabaseMock)},
        {provide: AuthService, useValue: instance(AuthService)},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).overrideComponent(ActionComponent, {
      set: {
        providers: [
          { provide: ActionService, useValue: instance(actionServiceMock) },
        ]
      }
    }).compileComponents();

  })().then(done).catch(done.fail));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
