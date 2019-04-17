import {ComponentFixture, TestBed} from '@angular/core/testing';

import { ActionComponent } from './action.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { AuthService } from '../auth/auth.service';
import {configureTestSuite} from '../../tests/utils/configure-test.suite.spec';
import {ActionService} from './action.service';
import * as firebase from 'firebase/app';
import { ActionButton } from './action-button';
import { ContextAction } from './enums/context-action.enum';
import { CurrentContextState } from './enums/context-state.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { ChartModule } from 'angular-highcharts';

describe('ActionComponent', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;
  let actionService: ActionService;
  let angularFireDatabase: AngularFireDatabase;

  const mockedDatabaseRef = {
    onDisconnect: () => {
      return {
        set: () => {}
      };
    }
  };

  const angularFireDatabaseMock: AngularFireDatabase = mock(AngularFireDatabase);
  const actionServiceMock: ActionService = mock(ActionService);
  const authServiceMock: AuthService = mock(AuthService);

  when(angularFireDatabaseMock.object(anything())).thenReturn(
    <any>{
      valueChanges: () => of({})
    }
  );

  when(authServiceMock.getUser()).thenReturn(of({} as firebase.User));
  when(actionServiceMock.getActionButtonReference()).thenReturn(of(
    ActionButton.changeContext(
      ContextAction.WaitForConnection,
      CurrentContextState.WaitForConnection,
      ButtonContextClass.WaitForConnection
    )
  ));

  configureTestSuite();

  beforeAll(done => (async () => {

    TestBed.configureTestingModule({
      imports: [
        ChartModule
      ],
      declarations: [ ActionComponent ],
      providers: [
        {provide: AngularFireDatabase, useValue: instance(angularFireDatabaseMock)},
        {provide: AuthService, useValue: instance(authServiceMock)},
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
    actionService = fixture.debugElement.injector.get(ActionService);
    angularFireDatabase = TestBed.get(AngularFireDatabase);

    angularFireDatabase.database.ref = (): any => mockedDatabaseRef;
    spyOn(actionService, 'getActionButtonReference').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should assign action button reference', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect(actionService.getActionButtonReference).toHaveBeenCalled();
  });

  it('should disable chart view', () => {
    // Act
    component.disableChartView();

    expect(component.showChart).toBeFalsy();
  });
});
