import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';
import { FirebaseObject } from '../core/enums/firebase-object';
import { ContextAction } from './enums/context-action.enum';
import { CurrentContextState } from './enums/context-state.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { ActionButton } from './action-button';

@Injectable()
export class ActionService {
  actionCounter$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private db: AngularFireDatabase
  ) { }

  initializaActionCounter(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).valueChanges().subscribe((counterValue: number) => {
      this.actionCounter$.next(counterValue);
    });
  }

  setWaitForConnectionState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.WaitForConnection,
      CurrentContextState.WaitForConnection,
      ButtonContextClass.WaitForConnection
    );
  }

  goToActionStartState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart,
      ButtonContextClass.ActionStart,
    );
  }

  loginAction(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart
    );
  }

  startActionAsPerformer(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionForPerformer,
      CurrentContextState.PerformerInAction,
      ButtonContextClass.PerformerInAction
    );
  }

  goToThankYouState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ThankYouInformation,
      CurrentContextState.ThankYouInformation,
      ButtonContextClass.ThankYouInformation,
    );
  }

  goToShowResultState(): ActionButton {
    return ActionButton.changeContext(
      this.actionCounter$.getValue(),
      CurrentContextState.ShowResult,
      ButtonContextClass.ShowResult,
    );
  }

  setEnableVotingForParticipant(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionForParticipant,
      CurrentContextState.ParticipantInAction,
      ButtonContextClass.ParticipantInAction
    );
  }

  resetTheResult(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
  }

  incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter$.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }
}
