import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { ButtonContextClass } from '../enums/button-context-class.enum';
import { FirebaseObject } from '../enums/firebase-object';
import { AppStateComponent } from '../core/app-state/app-state.component';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';
import * as firebase from 'firebase/app';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent extends AppStateComponent implements OnInit, OnDestroy {
  private actionRunning: Observable<boolean | null>;
  private actionRunning$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private currentPerformer: Observable<string | null>;

  public nextContextAction: ContextAction | number;
  public currentContextState: ContextState;
  public buttonContextClass: ButtonContextClass;
  private readonly resultAppearanceTime: number = 3000;

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService,
    public firabaseStateCommunicationService: FirabaseStateCommunicationService
  ) {
    super(firabaseStateCommunicationService);
  }

  ngOnInit() {
    this.authService.login();
    this.authService.user$.subscribe((user: (firebase.User | null)) => {
      if (!user) {
        this.setWaitForConnectionState();
        return;
      }

      this.watchForContextChanges();
      this.firabaseStateCommunicationService.initializaFirebaseState();
      this.db.object(FirebaseObject.Connected).set(true);
      this.goToActionStartState();
    });

    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
  }

  public ngOnDestroy(): void {

  }

  public performContextAction(): void {
    switch (this.currentContextState) {
      case ContextState.LoginView:
        this.loginAction();
        break;

      case ContextState.ActionStart:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(true);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(this.authService.user$.getValue().uid);
        break;

      case ContextState.PerformerInAction:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(false);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(null);
        break;

      case ContextState.ParticipantInAction:
        this.incrementSpeachFeature();
        break;

      case ContextState.ShowResult:
        this.goToActiveContext();
        break;

      default:
      throw new Error('Unrecognized action');
    }
  }

  private loginAction(): void {
    this.nextContextAction = ContextAction.ActionStart;
    this.currentContextState = ContextState.ActionStart;
  }

  private startActionAsPerformer(): void {
    this.nextContextAction = ContextAction.ActionForPerformer;
    this.currentContextState = ContextState.PerformerInAction;
    this.buttonContextClass = ButtonContextClass.PerformerInAction;
  }

  private enableVotingForParticipant(): void {
    this.nextContextAction = ContextAction.ActionForParticipant;
    this.currentContextState = ContextState.ParticipantInAction;
    this.buttonContextClass = ButtonContextClass.ParticipantInAction;
  }

  private goToActionStartState(): void {
    this.nextContextAction = ContextAction.ActionStart;
    this.currentContextState = ContextState.ActionStart;
    this.buttonContextClass = ButtonContextClass.ActionStart;
  }

  private goToShowResultState(): void {
    this.nextContextAction = this.actionCounter.getValue();
    this.currentContextState = ContextState.ShowResult;
    this.buttonContextClass = ButtonContextClass.ShowResult;
  }

  private setWaitForConnectionState(): void {
    this.nextContextAction = ContextAction.WaitForConnection;
    this.currentContextState = ContextState.WaitForConnection;
    this.buttonContextClass = ButtonContextClass.WaitForConnection;
  }

  private resetTheResult() {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
  }

  private changeContext(speachRunning: boolean, currentSpeaker: string): void {
    if (this.someoneElseStartedAction(speachRunning, currentSpeaker)) {
      this.enableVotingForParticipant();
      return;
    }

    if (this.itWasMeWhoStartedAction(speachRunning, currentSpeaker)) {
      this.startActionAsPerformer();
      return;
    }

    if (this.someoneElseFinishedTheAction(speachRunning, currentSpeaker)) {
      this.goToActionStartState();
      return;
    }

    if (this.itWasMeWhoFinishedTheAction(speachRunning, currentSpeaker)) {
      this.goToShowResultState();
      this.resetTheResult();
      this.goToActionStartStateInDelay();
      return;
    }
  }

  private itWasMeWhoStartedAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return speachRunning && currentSpeaker === this.authService.userUid;
  }

  private someoneElseStartedAction(speachRunning: boolean, currentSpeaker: string) {
    return speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private itWasMeWhoFinishedTheAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return !speachRunning && currentSpeaker === this.authService.userUid;
  }

  private someoneElseFinishedTheAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return !speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }

  private watchForContextChanges(): void {
    this.actionRunning = this.db.object<boolean>(FirebaseObject.ActionRunning).valueChanges();
    this.currentPerformer = this.db.object<string>(FirebaseObject.CurrentPerformer).valueChanges();

    combineLatest(this.actionRunning, this.currentPerformer)
      .subscribe(([actionRunning, currentPerformer]: [boolean, string]) => {
        this.actionRunning$.next(actionRunning);

        if (!isNullOrUndefined(actionRunning) && !isNullOrUndefined(currentPerformer)) {
          this.changeContext(actionRunning, currentPerformer);
        }
      });
  }

  private goToActionStartStateInDelay(): void {
    setTimeout(() => {
      this.goToActiveContext();
    }, this.resultAppearanceTime);
  }

  private goToActiveContext(): void {
    if (!this.actionRunning$.getValue()) {
      this.goToActionStartState();
      return;
    }

    this.enableVotingForParticipant();
  }
}
