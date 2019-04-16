import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentContextState } from './enums/context-state.enum';
import { FirebaseObject } from '../core/enums/firebase-object';
import * as firebase from 'firebase/app';
import { ActionService } from './action.service';
import { ActionButton } from './action-button';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  providers: [ActionService]
})
export class ActionComponent implements OnInit, OnDestroy {
  actionButton$: Observable<ActionButton>;

  constructor(
    public authService: AuthService,
    public actionService: ActionService,
    private db: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.actionButton$ = this.actionService.actionButton$;
    this.authService.login();
    this.authService.user$.subscribe((user: (firebase.User | null)) => {
      if (!user) {
        return;
      }

      this.actionService.initializaActionCounter();
      this.actionService.goToActionStartState();
      this.actionService.watchForContextChanges();
    });

    this.db.database.ref(FirebaseObject.ActionRunning).onDisconnect().set(false);
  }

  ngOnDestroy(): void { }

  performContextAction(): void {
    switch (this.actionService.getCurrentContextState()) {
      case CurrentContextState.LoginView:
        this.actionService.loginAction();
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
        this.actionService.incrementSpeachFeature();
        break;

      case CurrentContextState.ShowResult:
        break;

      case CurrentContextState.ThankYouInformation:
        break;

      default:
      throw new Error('Unrecognized action');
    }
  }
}
