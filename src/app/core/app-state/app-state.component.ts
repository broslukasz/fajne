import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FirabaseStateCommunicationService } from '../firabase-state-communication.service';

@Component({
  selector: 'app-app-state',
  templateUrl: './app-state.component.html',
  styleUrls: ['./app-state.component.scss']
})
export class AppStateComponent implements OnInit {

  constructor(
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) { }

  ngOnInit() {
  }

  public get connected(): Observable<boolean> {
    return this.firabaseStateCommunicationService.connected;
  }

}
