import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirabaseStateCommunicationService } from '../firabase-state-communication.service';

@Component({
  selector: 'app-state',
  templateUrl: './app-state.component.html',
  styleUrls: ['./app-state.component.scss']
})
export class AppStateComponent implements OnInit {


  constructor(
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) { }

  ngOnInit() {
  }

  public get actionCounter(): BehaviorSubject<number> {
    return this.firabaseStateCommunicationService.actionCounter$;
  }

}
