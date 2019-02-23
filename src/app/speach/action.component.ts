import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { ButtonContextClass } from '../enums/button-context-class.enum';
import * as firebase from 'firebase/app';
import { FirebaseObject } from '../enums/firebase-object';
import { AppStateComponent } from '../core/app-state/app-state.component';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';

@Component({
  selector: 'fajne-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent extends AppStateComponent implements OnInit, OnDestroy {
  private speachRunning: Observable<boolean | null>;
  private currentSpeaker: Observable<string | null>;

  public contextAction: ContextAction;
  public contextState: ContextState;
  public buttonContextClass: ButtonContextClass;

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService,
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) {
    super(firabaseStateCommunicationService);
  }

  ngOnInit() {
    this.initializeContextState();
    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);

    this.speachRunning = this.db.object<boolean>(FirebaseObject.ActionRunning).valueChanges();
    this.currentSpeaker = this.db.object<string>(FirebaseObject.CurrentPerformer).valueChanges();

    combineLatest(this.speachRunning, this.currentSpeaker)
      .subscribe(([speachRunning, currentSpeaker]: [boolean, string]) => {
        this.performContextTransition(speachRunning, currentSpeaker);
      });
  }

  public ngOnDestroy(): void {

  }

  public performContextAction(): void {
    switch (this.contextState) {
      case ContextState.LoginView:
        this.loginAction();
        break;

      case ContextState.ActionStart:
        this.authService.user$.subscribe((user: firebase.User) => {
          this.db.object<boolean>(FirebaseObject.ActionRunning).set(true);
          this.db.object<string>(FirebaseObject.CurrentPerformer).set(user.uid);
        });
        break;

      case ContextState.PerformerInAction:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(false);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(null);
        break;

      case ContextState.ParticipantInAction:
        this.incrementSpeachFeature();
        break;
      default:
      throw new Error('Unrecognized action');
    }
  }

  private initializeContextState(): void {
    this.authService.login();
    this.buttonContextClass = ButtonContextClass.ActionStart;
    this.loginAction();
  }

  private loginAction(): void {
    this.contextAction = ContextAction.ActionStart;
    this.contextState = ContextState.ActionStart;
  }

  private startAction(): void {
    this.contextAction = ContextAction.PerformerInAction;
    this.contextState = ContextState.PerformerInAction;
    this.buttonContextClass = ButtonContextClass.PerformerInAction;
  }

  private setStateAsParticipant(): void {
    this.contextAction = ContextAction.ParticipantInAction;
    this.contextState = ContextState.ParticipantInAction;
    this.buttonContextClass = ButtonContextClass.ParticipantInAction;
  }

  private performerStopsAction(): void {
    this.contextAction = ContextAction.ActionStart;
    this.contextState = ContextState.ActionStart;
    this.buttonContextClass = ButtonContextClass.ActionStart;
  }

  private performContextTransition(speachRunning: boolean, currentSpeaker: string): void {
    if (this.iAmThePerformer(speachRunning, currentSpeaker)) {
      this.startAction();
    }

    if (this.iAmTheParticipant(speachRunning, currentSpeaker)) {
      this.setStateAsParticipant();
    }

    if (!speachRunning) {
      this.performerStopsAction();
    }
  }

  private iAmThePerformer(speachRunning: boolean, currentSpeaker: string): boolean {
    return speachRunning && currentSpeaker === this.authService.userUid;
  }

  private iAmTheParticipant(speachRunning: boolean, currentSpeaker: string) {
    return speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }
}
