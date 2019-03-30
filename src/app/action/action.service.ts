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
  public actionCounter$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private db: AngularFireDatabase
  ) { }

  public initializaActionCounter(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).valueChanges().subscribe((counterValue: number) => {
      this.actionCounter$.next(counterValue);
    });
  }

  public setWaitForConnectionState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.WaitForConnection,
      CurrentContextState.WaitForConnection,
      ButtonContextClass.WaitForConnection
    );
  }

  public goToActionStartState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart,
      ButtonContextClass.ActionStart,
    );
  }

  public loginAction(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart
    );
  }

  public startActionAsPerformer(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionForPerformer,
      CurrentContextState.PerformerInAction,
      ButtonContextClass.PerformerInAction
    );
  }

  public goToThankYouState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ThankYouInformation,
      CurrentContextState.ThankYouInformation,
      ButtonContextClass.ThankYouInformation,
    );
  }

  public goToShowResultState(): ActionButton {
    return ActionButton.changeContext(
      this.actionCounter$.getValue(),
      CurrentContextState.ShowResult,
      ButtonContextClass.ShowResult,
    );
  }

  public setEnableVotingForParticipant(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.ActionForParticipant,
      CurrentContextState.ParticipantInAction,
      ButtonContextClass.ParticipantInAction
    );
  }
}
