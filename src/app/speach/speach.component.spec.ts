import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeachComponent } from './speach.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('SpeachComponent', () => {
  let component: SpeachComponent;
  let fixture: ComponentFixture<SpeachComponent>;
  let angularFireDatabase: AngularFireDatabase;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeachComponent ],
      providers: [
        {provide: AngularFireDatabase, useValue: {
            object: () => {
              return {valueChanges: () => of({})};
            }
          }}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeachComponent);
    component = fixture.componentInstance;
    angularFireDatabase = TestBed.get(AngularFireDatabase);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
