import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { ButtonContextClass } from '../enums/button-context-class.enum';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent implements OnInit, OnDestroy {
  private connected: Observable<boolean | null>;
  private speachRunning: Observable<boolean | null>;
  private currentSpeaker: Observable<string | null>;

  public contextAction: ContextAction;
  public contextState: ContextState;
  public buttonContextClass: ButtonContextClass;

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeContextState();
    this.db.database.ref('speach-running').onDisconnect().set(false);

    this.connected = this.db.object<boolean>('connected').valueChanges();
    this.speachRunning = this.db.object<boolean>('speach-running').valueChanges();
    this.currentSpeaker = this.db.object<string>('current-speaker').valueChanges();

    combineLatest(this.speachRunning, this.currentSpeaker)
      .subscribe(([speachRunning, currentSpeaker]: [boolean, string]) => {
        this.performContextTransition(speachRunning, currentSpeaker);
      });
  }

  public ngOnDestroy(): void {

  }

  public performContextAction(): void {
    switch(this.contextState) {
      case ContextState.LoginView:
        this.loginAction();
        break;

      case ContextState.SpeachStart:
        this.authService.user$.subscribe((user: firebase.User) => {
          this.db.object<boolean>('speach-running').set(true);
          this.db.object<string>('current-speaker').set(user.uid);
        });
        break;

      case ContextState.SpeakerInSpeach:
        this.db.object<boolean>('speach-running').set(false);
        this.db.object<string>('current-speaker').set(null);
        break;

      case ContextState.ParticipantInSpeach:
        this.markSpeachAsCool();
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

  private markSpeachAsCool(): void {
    this.db.object<boolean>('coolness-counter').update(true);
  }
}
