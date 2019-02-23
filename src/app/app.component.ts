import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FirabaseStateCommunicationService } from './core/firabase-state-communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private firabaseStateCommunicationService: FirabaseStateCommunicationService
    ) {}

  public ngOnInit(): void {
    this.firabaseStateCommunicationService.initializaFirebaseStete();
  }

  public get connected(): Observable<boolean> {
    return this.firabaseStateCommunicationService.connected;
  }
}
