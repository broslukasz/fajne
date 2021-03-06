import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentContextState } from './enums/context-state.enum';
import { FirebaseObject } from '../core/enums/firebase-object';
import * as firebase from 'firebase/app';
import { ActionService } from './action.service';
import { ActionButton } from './action-button';
import { ChartService } from './services/chart.service';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  providers: [ActionService, ChartService]
})
export class ActionComponent implements OnInit, OnDestroy {
  chart: Chart;
  actionButton$: Observable<ActionButton>;
  showChart = false;

  private userSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public actionService: ActionService,
    public chartService: ChartService,
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
      this.chartService.initializaActionCounter();
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
        this.chartService.setActionStartTime(Date.now());
        this.chartService.resetChartData();
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
        this.chart = this.chartService.getChart();
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
