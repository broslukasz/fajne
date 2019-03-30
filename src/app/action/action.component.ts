import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentContextState } from './enums/context-state.enum';
import { ContextAction } from './enums/context-action.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { FirebaseObject } from '../core/enums/firebase-object';
import * as firebase from 'firebase/app';
import { isNullOrUndefined } from 'util';
import { ActionService } from './action.service';
import { ActionButton } from './action-button';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  providers: [ActionService]
})
export class ActionComponent implements OnInit, OnDestroy {
  private actionRunning$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public actionButton: ActionButton;

  private readonly resultAppearanceTime: number = 3000;

  constructor(
    public authService: AuthService,
    public actionService: ActionService,
    private db: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.authService.login();
    this.authService.user$.subscribe((user: (firebase.User | null)) => {
      if (!user) {
        this.actionButton = this.actionService.setWaitForConnectionState();
        return;
      }

      this.actionService.initializaActionCounter();
      this.actionButton = this.actionService.goToActionStartState();
      this.watchForContextChanges();
    });

    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
  }

  public ngOnDestroy(): void { }

  public performContextAction(): void {
    switch (this.actionButton.currentContextState) {
      case CurrentContextState.LoginView:
        this.actionButton = this.actionService.loginAction();
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

      case CurrentContextState.ThankYouInformation:
        break;

      default:
      throw new Error('Unrecognized action');
    }
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

  private reactOnNewContext(actionRunning: boolean, currentSpeaker: string): void {
    if (this.someoneElseStartedAction(actionRunning, currentSpeaker)) {
      this.enableVotingForParticipant();
      return;
    }

    if (this.itWasMeWhoStartedAction(actionRunning, currentSpeaker)) {
      this.actionButton = this.actionService.startActionAsPerformer();
      return;
    }

    if (this.someoneElseFinishedTheAction(actionRunning, currentSpeaker)) {
      this.actionButton = this.actionService.goToThankYouState();
      setTimeout(() => this.actionButton = this.actionService.goToActionStartState(), this.resultAppearanceTime);
      return;
    }

    if (this.itWasMeWhoFinishedTheAction(actionRunning, currentSpeaker)) {
      this.actionButton = this.actionService.goToShowResultState();
      this.resetTheResult();
      setTimeout(() => this.actionButton = this.actionService.goToActionStartState(), this.resultAppearanceTime);
      return;
    }
  }

  private enableVotingForParticipant(): void {
    if (this.actionButton.currentContextState === CurrentContextState.ShowResult) {
      setTimeout(() => this.actionButton = this.actionService.setEnableVotingForParticipant(), this.resultAppearanceTime);
      return;
    }

    this.actionButton = this.actionService.setEnableVotingForParticipant();
  }

  private resetTheResult() {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
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
           this.actionButton.currentContextState === CurrentContextState.PerformerInAction;
  }

  private someoneElseFinishedTheAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return !speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionService.actionCounter$.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }
}
