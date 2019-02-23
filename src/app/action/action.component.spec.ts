import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionComponent } from './action.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { AuthService } from '../auth/auth.service';

describe('ActionComponent', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;
  const angularFireDatabaseMock: AngularFireDatabase = mock(AngularFireDatabase);

  when(angularFireDatabaseMock.object(anything())).thenReturn(
    <any>{
      valueChanges: () => of({})
    }
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionComponent ],
      providers: [
        {provide: AngularFireDatabase, useValue: instance(angularFireDatabaseMock)},
        {provide: AuthService, useValue: instance(AuthService)}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
