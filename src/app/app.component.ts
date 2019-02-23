import { Component, OnInit } from '@angular/core';
import { FirabaseStateCommunicationService } from './core/firabase-state-communication.service';
import { AppStateComponent } from './core/app-state/app-state.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends AppStateComponent implements OnInit {
  constructor(
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) {
    super(firabaseStateCommunicationService);
  }

  public ngOnInit(): void {
    this.firabaseStateCommunicationService.initializaFirebaseStete();
  }
}
