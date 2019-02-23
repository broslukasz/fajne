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
    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
    this.initializeContextState();
    this.watchForContextChanges();
  }

  public ngOnDestroy(): void {

  }

  public performContextAction(): void {
    switch (this.contextState) {
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
    this.authService.login();
    this.buttonContextClass = ButtonContextClass.ActionStart;
    this.loginAction();
  }

  private loginAction(): void {
    this.contextAction = ContextAction.ActionStart;
    this.contextState = ContextState.ActionStart;
  }

  private startActionAsPerformer(): void {
    this.contextAction = ContextAction.PerformerInAction;
    this.contextState = ContextState.PerformerInAction;
    this.buttonContextClass = ButtonContextClass.PerformerInAction;
  }

  private enableVotingForParticipant(): void {
    this.contextAction = ContextAction.ParticipantInAction;
    this.contextState = ContextState.ParticipantInAction;
    this.buttonContextClass = ButtonContextClass.ParticipantInAction;
  }

  private performerStopsAction(): void {
    this.contextAction = ContextAction.ActionStart;
    this.contextState = ContextState.ActionStart;
    this.buttonContextClass = ButtonContextClass.ActionStart;
  }

  private changeContext(speachRunning: boolean, currentSpeaker: string): void {
    if (this.itWasMeWhoStartedAction(speachRunning, currentSpeaker)) {
      this.startActionAsPerformer();
    }

    if (this.someoneElseStartedAction(speachRunning, currentSpeaker)) {
      this.enableVotingForParticipant();
    }

    if (!speachRunning) {
      this.performerStopsAction();
    }
  }

  private itWasMeWhoStartedAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return speachRunning && currentSpeaker === this.authService.userUid;
  }

  private someoneElseStartedAction(speachRunning: boolean, currentSpeaker: string) {
    return speachRunning && currentSpeaker !== this.authService.userUid;
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
}
