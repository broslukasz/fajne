import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { ButtonContextClass } from '../enums/button-context-class.enum';
import { FirebaseObject } from '../enums/firebase-object';
import { AppStateComponent } from '../core/app-state/app-state.component';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent extends AppStateComponent implements OnInit, OnDestroy {
  private actionRunning: Observable<boolean | null>;
  private currentPerformer: Observable<string | null>;

  public nextContextAction: ContextAction;
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
    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
    this.initializeContextState();
    this.watchForContextChanges();
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
      default:
      throw new Error('Unrecognized action');
    }
  }

  private initializeContextState(): void {
    this.connected.subscribe((connected: boolean) => {
      if (!connected) {
        this.setWaitForConnectionState();
        return;
      }

      this.authService.login();
    });
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

  private setWaitForConnectionState(): void {
    this.nextContextAction = ContextAction.WaitForConnection;
    this.currentContextState = ContextState.WaitForConnection;
    this.buttonContextClass = ButtonContextClass.WaitForConnection;
  }

  private showMeTheResult() {
    this.firabaseStateCommunicationService.isResultAvailable$.next(true);
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
      this.goToActionStartState();
      this.showMeTheResult();
      this.setTimerForResultDisplay();
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
      .subscribe(([speachRunning, currentSpeaker]: [boolean, string]) => {
        this.changeContext(speachRunning, currentSpeaker);
      });
  }

  private setTimerForResultDisplay(): void {
    setTimeout(() => {
      this.firabaseStateCommunicationService.isResultAvailable$.next(false);
    }, this.resultAppearanceTime);
  }
}
