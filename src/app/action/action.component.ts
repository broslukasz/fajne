import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentContextState } from './enums/context-state.enum';
import { ContextAction } from './enums/context-action.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { FirebaseObject } from '../core/enums/firebase-object';
import { AppStateComponent } from '../core/app-state/app-state.component';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';
import * as firebase from 'firebase/app';
import { isNullOrUndefined } from 'util';
import { ActionService } from './action.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  providers: [ActionService]
})
export class ActionComponent extends AppStateComponent implements OnInit, OnDestroy {
  private actionRunning$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public nextContextAction: ContextAction | number;
  public currentContextState: CurrentContextState;
  public buttonContextClass: ButtonContextClass;
  private readonly resultAppearanceTime: number = 3000;

  constructor(
    public authService: AuthService,
    public firabaseStateCommunicationService: FirabaseStateCommunicationService,
    public actionService: ActionService,
    private db: AngularFireDatabase
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

      this.firabaseStateCommunicationService.initializaActionCounter();
      this.loggedIn.next(true);
      this.goToActionStartState();
      this.watchForContextChanges();
    });

    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
  }

  public ngOnDestroy(): void {

  }

  public performContextAction(): void {
    switch (this.currentContextState) {
      case CurrentContextState.LoginView:
        this.loginAction();
        break;

      case CurrentContextState.ActionStart:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(true);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(this.authService.user$.getValue().uid);
        break;

      case CurrentContextState.PerformerInAction:
        this.db.object<boolean>(FirebaseObject.ActionRunning).set(false);
        this.db.object<string>(FirebaseObject.CurrentPerformer).set(null);
        break;

      case CurrentContextState.ParticipantInAction:
        this.incrementSpeachFeature();
        break;

      case CurrentContextState.ShowResult:
        break;

      default:
      throw new Error('Unrecognized action');
    }
  }

  private loginAction(): void {
    this.nextContextAction = ContextAction.ActionStart;
    this.currentContextState = CurrentContextState.ActionStart;
  }

  private startActionAsPerformer(): void {
    this.nextContextAction = ContextAction.ActionForPerformer;
    this.currentContextState = CurrentContextState.PerformerInAction;
    this.buttonContextClass = ButtonContextClass.PerformerInAction;
  }

  private enableVotingForParticipant(): void {
    if (this.currentContextState === CurrentContextState.ShowResult) {
      setTimeout(() => this.setEnableVotingForParticipant(), this.resultAppearanceTime);
      return;
    }

    this.setEnableVotingForParticipant();
  }

  private goToActionStartState(): void {
    this.nextContextAction = ContextAction.ActionStart;
    this.currentContextState = CurrentContextState.ActionStart;
    this.buttonContextClass = ButtonContextClass.ActionStart;
  }

  private goToShowResultState(): void {
    this.nextContextAction = this.actionCounter.getValue();
    this.currentContextState = CurrentContextState.ShowResult;
    this.buttonContextClass = ButtonContextClass.ShowResult;
  }

  private setWaitForConnectionState(): void {
    this.nextContextAction = ContextAction.WaitForConnection;
    this.currentContextState = CurrentContextState.WaitForConnection;
    this.buttonContextClass = ButtonContextClass.WaitForConnection;
  }

  private resetTheResult() {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
  }

  private reactOnNewContext(actionRunning: boolean, currentSpeaker: string): void {
    if (this.someoneElseStartedAction(actionRunning, currentSpeaker)) {
      this.enableVotingForParticipant();
      return;
    }

    if (this.itWasMeWhoStartedAction(actionRunning, currentSpeaker)) {
      this.startActionAsPerformer();
      return;
    }

    if (this.someoneElseFinishedTheAction(actionRunning, currentSpeaker)) {
      this.goToActionStartState();
      return;
    }

    if (this.itWasMeWhoFinishedTheAction(actionRunning, currentSpeaker)) {
      this.goToShowResultState();
      this.resetTheResult();
      this.goToActiveContextInDelay();
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
    return !speachRunning &&
           currentSpeaker === this.authService.userUid &&
           this.currentContextState === CurrentContextState.PerformerInAction;
  }

  private someoneElseFinishedTheAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return !speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }

  private watchForContextChanges(): void {
    combineLatest(
      this.db.object<boolean>(FirebaseObject.ActionRunning).valueChanges(),
      this.db.object<string>(FirebaseObject.CurrentPerformer).valueChanges()
    )
      .subscribe(([actionRunning, currentPerformer]: [boolean, string]) => {
        this.actionRunning$.next(actionRunning);

        if (!isNullOrUndefined(actionRunning) && !isNullOrUndefined(currentPerformer)) {
          this.reactOnNewContext(actionRunning, currentPerformer);
        }
      });
  }

  private goToActiveContextInDelay(): void {
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

  private setEnableVotingForParticipant() {
    this.nextContextAction = ContextAction.ActionForParticipant;
    this.currentContextState = CurrentContextState.ParticipantInAction;
    this.buttonContextClass = ButtonContextClass.ParticipantInAction;
  }
}
