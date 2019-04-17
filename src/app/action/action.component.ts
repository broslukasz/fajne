import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentContextState } from './enums/context-state.enum';
import { FirebaseObject } from '../core/enums/firebase-object';
import * as firebase from 'firebase/app';
import { ActionService } from './action.service';
import { ActionButton } from './action-button';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  providers: [ActionService]
})
export class ActionComponent implements OnInit, OnDestroy {
  readonly data = [3.5, 3, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
    3.7, 3.4, 3, 3, 4, 4.4, 3.9, 3.5, 3.8, 3.8, 3.4, 3.7, 3.6, 3.3,
    3.4, 3, 3.4, 3.5, 3.4, 3.2, 3.1, 3.4, 4.1, 4.2, 3.1, 3.2, 3.5,
    3.6, 3, 3.4, 3.5];

  chart = new Chart({
    title: {
      text: 'Reaction in time'
    },
    xAxis: [{
      title: {text: 'Time'},
      alignTicks: false
    }],

    yAxis: [{
      title: {text: ''},
    }],

    series: [ {
      name: 'single click',
      type: 'scatter',
      data: this.data,
      id: 's1',
      marker: {
        radius: 1.5
      }
    }]
  });

  actionButton$: Observable<ActionButton>;
  showChart = false;

  private userSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public actionService: ActionService,
    private db: AngularFireDatabase
  ) {
  }

  ngOnInit() {
    this.actionButton$ = this.actionService.getActionButtonReference();
    this.authService.login();
    this.userSubscription = this.authService.getUser().subscribe((user: (firebase.User | null)) => {
      if (!user) {
        return;
      }

      this.actionService.initializaActionCounter();
      this.actionService.goToActionStartState();
      this.actionService.watchForContextChanges();
    });

    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  performContextAction(): void {
    switch (this.actionService.getCurrentContextState()) {
      case CurrentContextState.LoginView:
        this.actionService.loginAction();
        break;

      case CurrentContextState.ActionStart:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(true);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(this.authService.getUserValue().uid);
        break;

      case CurrentContextState.PerformerInAction:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(false);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(null);
        break;

      case CurrentContextState.ParticipantInAction:
        this.actionService.incrementSpeachFeature();
        break;

      case CurrentContextState.ShowResult:
        this.showChart = !this.showChart;
        break;

      case CurrentContextState.ThankYouInformation:
        break;

      default:
        throw new Error('Unrecognized action');
    }
  }

  disableChartView() {
    if (this.showChart) {
      this.showChart = false;
    }
  }
}
