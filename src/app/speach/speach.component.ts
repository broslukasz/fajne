import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { log } from 'util';

@Component({
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent implements OnInit {
  private connected: Observable<boolean | null>;
  contextAction: ContextAction;
  contextState: ContextState;

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeContextState();

    this.connected = this.db.object<boolean>('connected').valueChanges();

    combineLatest(this.connected, this.authService.user$)
      .subscribe(([connected, authState]: [boolean, any]) => {
        log('connected', connected)
        log('authState', authState)
      })
  }

  public performContextAction(): void {
    switch(this.contextState) {
      case ContextState.LoginView:
        this.performLogin();
        break;

      case ContextState.SpeachStart:
        this.performSpeachStart();
        break;

      case ContextState.SpeakerInSpeach:
        this.performSpeachStop();
        break;

      case ContextState.ParticipantInSpeach:
        this.makeSpeachCool();
        break;
      default:
      throw new Error('Unrecognized action');
    }
  }

  private initializeContextState(): void {
    this.contextState = ContextState.LoginView;
    this.contextAction = ContextAction.LoginView;
  }

  private performLogin(): void {
    this.authService.login();
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
  }

  private performSpeachStart(): void {
    this.contextAction = ContextAction.SpeakerInSpeach;
    this.contextState = ContextState.SpeakerInSpeach;
  }

  private performSpeachStop(): void {
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
  }

  private makeSpeachCool(): void {

  }
}
