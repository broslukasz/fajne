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
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent extends AppStateComponent implements OnInit, OnDestroy {
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
    this.db.database.ref(FirebaseObject.speachRunning).onDisconnect().set(false);

    this.speachRunning = this.db.object<boolean>(FirebaseObject.speachRunning).valueChanges();
    this.currentSpeaker = this.db.object<string>(FirebaseObject.currentSpeaker).valueChanges();

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

      case ContextState.SpeachStart:
        this.authService.user$.subscribe((user: firebase.User) => {
          this.db.object<boolean>(FirebaseObject.speachRunning).set(true);
          this.db.object<string>(FirebaseObject.currentSpeaker).set(user.uid);
        });
        break;

      case ContextState.SpeakerInSpeach:
        this.db.object<boolean>(FirebaseObject.speachRunning).set(false);
        this.db.object<string>(FirebaseObject.currentSpeaker).set(null);
        break;

      case ContextState.ParticipantInSpeach:
        this.incrementSpeachFeature();
        break;
      default:
      throw new Error('Unrecognized action');
    }
  }

  private initializeContextState(): void {
    this.authService.login();
    this.buttonContextClass = ButtonContextClass.SpeachStart;
    this.loginAction();
  }

  private loginAction(): void {
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
  }

  private speachStartAction(): void {
    this.contextAction = ContextAction.SpeakerInSpeach;
    this.contextState = ContextState.SpeakerInSpeach;
    this.buttonContextClass = ButtonContextClass.SpeakerInSpeach;
  }

  private setStateAsParticipantAction(): void {
    this.contextAction = ContextAction.ParticipantInSpeach;
    this.contextState = ContextState.ParticipantInSpeach;
    this.buttonContextClass = ButtonContextClass.ParticipantInSpeach;
  }

  private speakerStopsSpeachAction(): void {
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
    this.buttonContextClass = ButtonContextClass.SpeachStart;
  }

  private performContextTransition(speachRunning: boolean, currentSpeaker: string): void {
    if (this.iAmTheSpeaker(speachRunning, currentSpeaker)) {
      this.speachStartAction();
    }

    if (this.iAmTheParticipant(speachRunning, currentSpeaker)) {
      this.setStateAsParticipantAction();
    }

    if (!speachRunning) {
      this.speakerStopsSpeachAction();
    }
  }

  private iAmTheSpeaker(speachRunning: boolean, currentSpeaker: string): boolean {
    return speachRunning && currentSpeaker === this.authService.userUid;
  }

  private iAmTheParticipant(speachRunning: boolean, currentSpeaker: string) {
    return speachRunning && currentSpeaker !== this.authService.userUid;
  }

  private incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter.getValue();
    this.db.object<number>(FirebaseObject.fajneCounter).set(++currentActionCounterValue);
  }
}
