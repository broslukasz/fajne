import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStateComponent } from './app-state.component';
import { FirabaseStateCommunicationService } from '../firabase-state-communication.service';
import { instance, mock } from 'ts-mockito';

describe('AppStateComponent', () => {
  let component: AppStateComponent;
  let fixture: ComponentFixture<AppStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppStateComponent ],
      providers: [
        {provide: FirabaseStateCommunicationService, useValue: instance(mock(FirabaseStateCommunicationService))}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
