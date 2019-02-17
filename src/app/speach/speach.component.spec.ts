import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeachComponent } from './speach.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';
import { AuthService } from '../auth/auth.service';

describe('SpeachComponent', () => {
  let component: SpeachComponent;
  let fixture: ComponentFixture<SpeachComponent>;
  let angularFireDatabase: AngularFireDatabase;
  let angularFireDatabaseMock: AngularFireDatabase = mock(AngularFireDatabase);

  when(angularFireDatabaseMock.object(anything())).thenReturn(
    <any>{
      valueChanges: () => of({})
    }
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeachComponent ],
      providers: [
        {provide: AngularFireDatabase, useValue: instance(angularFireDatabaseMock)},
        {provide: AuthService, useValue: instance(AuthService)}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeachComponent);
    component = fixture.componentInstance;
    angularFireDatabase = TestBed.get(AngularFireDatabase);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
