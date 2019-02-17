import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContextState } from '../enums/context-state.enum';
import { ContextAction } from '../enums/context-action.enum';
import { ButtonContextClass } from '../enums/button-context-class.enum';

@Component({
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent implements OnInit {
  private connected: Observable<boolean | null>;
  contextAction: ContextAction;
  contextState: ContextState;
  buttonContextClass: ButtonContextClass;

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeContextState();

    this.connected = this.db.object<boolean>('connected').valueChanges();

    combineLatest(this.connected, this.authService.user$)
      .subscribe(([connected, authState]: [boolean, any]) => {
        console.log('connected', connected);
        console.log('authState', authState);
      })
  }

  public performContextAction(): void {
    switch(this.contextState) {
      case ContextState.LoginView:
        this.finishLoginState();
        break;

      case ContextState.SpeachStart:
        this.finishSpeachStartState();
        break;

      case ContextState.SpeakerInSpeach:
        this.finishSpeachStopState();
        break;

      case ContextState.ParticipantInSpeach:
        this.makeSpeachCool();
        break;
      default:
      throw new Error('Unrecognized action');
    }
  }

  private initializeContextState(): void {
    this.authService.login();
    this.buttonContextClass = ButtonContextClass.SpeachStart;
    this.finishLoginState();
  }

  private finishLoginState(): void {
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
  }

  private finishSpeachStartState(): void {
    this.contextAction = ContextAction.SpeakerInSpeach;
    this.contextState = ContextState.SpeakerInSpeach;
    this.buttonContextClass = ButtonContextClass.SpeakerInSpeach;
  }

  private finishSpeachStopState(): void {
    this.contextAction = ContextAction.SpeachStart;
    this.contextState = ContextState.SpeachStart;
    this.buttonContextClass = ButtonContextClass.SpeachStart;
  }

  private makeSpeachCool(): void {

  }
}
