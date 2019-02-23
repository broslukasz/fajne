import { Component, OnInit } from '@angular/core';
import { FirabaseStateCommunicationService } from './core/firabase-state-communication.service';
import { AppStateComponent } from './core/app-state/app-state.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends AppStateComponent implements OnInit {
  public isResultAvailable: boolean;
  public result: number;

  constructor(
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) {
    super(firabaseStateCommunicationService);
  }

  public ngOnInit(): void {
    this.firabaseStateCommunicationService.initializaFirebaseStete();

    this.watchForResultAvailbility();
  }

  private watchForResultAvailbility(): void {
    this.firabaseStateCommunicationService.isResultAvailable$.subscribe((isResultAvailable: boolean) => {
      this.isResultAvailable = isResultAvailable;

      if (isResultAvailable) {
        this.result = _.cloneDeep(this.actionCounter.getValue());
      }
    });
  }
}
