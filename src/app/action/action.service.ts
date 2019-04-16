import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { FirebaseObject } from '../core/enums/firebase-object';
import { ContextAction } from './enums/context-action.enum';
import { CurrentContextState } from './enums/context-state.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { ActionButton } from './action-button';
import { isNullOrUndefined } from 'util';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ActionService {
  private readonly resultAppearanceTime: number = 3000;
  private actionButtonSource = new BehaviorSubject<ActionButton>(this.setWaitForConnectionState());

  actionCounter$: BehaviorSubject<number> = new BehaviorSubject(0);
  actionButton$: Observable<ActionButton> = this.actionButtonSource.asObservable();

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) { }

  getActionButtonReference(): Observable<ActionButton> {
    return this.actionButton$;
  }

  initializaActionCounter(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).valueChanges().subscribe((counterValue: number) => {
      this.actionCounter$.next(counterValue);
    });
  }

  private setWaitForConnectionState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.WaitForConnection,
      CurrentContextState.WaitForConnection,
      ButtonContextClass.WaitForConnection
    );
  }

  goToActionStartState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart,
      ButtonContextClass.ActionStart,
    ));
  }

  loginAction(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart
    ));
  }

  startActionAsPerformer(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionForPerformer,
      CurrentContextState.PerformerInAction,
      ButtonContextClass.PerformerInAction
    ));
  }

  goToThankYouState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ThankYouInformation,
      CurrentContextState.ThankYouInformation,
      ButtonContextClass.ThankYouInformation,
    ));
  }

  goToShowResultState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      this.actionCounter$.getValue(),
      CurrentContextState.ShowResult,
      ButtonContextClass.ShowResult,
    ));
  }

  setEnableVotingForParticipant(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionForParticipant,
      CurrentContextState.ParticipantInAction,
      ButtonContextClass.ParticipantInAction
    ));
  }

  resetTheResult(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
  }

  incrementSpeachFeature(): void {
    let currentActionCounterValue: number = this.actionCounter$.getValue();
    this.db.object<number>(FirebaseObject.ActionCounter).set(++currentActionCounterValue);
  }

  getCurrentContextState(): CurrentContextState {
    return this.actionButtonSource.getValue().currentContextState;
  }

  watchForContextChanges(): void {
    combineLatest(
      this.db.object<boolean>(FirebaseObject.ActionRunning).valueChanges(),
      this.db.object<string>(FirebaseObject.CurrentPerformer).valueChanges()
    )
      .subscribe(([actionRunning, currentPerformer]: [boolean, string]) => {
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
      this.startActionAsPerformer();
      return;
    }

    if (this.someoneElseFinishedTheAction(actionRunning, currentSpeaker)) {
      this.goToThankYouState();
      setTimeout(() => this.goToActionStartState(), this.resultAppearanceTime);
      return;
    }

    if (this.itWasMeWhoFinishedTheAction(actionRunning, currentSpeaker)) {
      this.goToShowResultState();
      this.resetTheResult();
      setTimeout(() => this.goToActionStartState(), this.resultAppearanceTime);
      return;
    }
  }

  private enableVotingForParticipant(): void {
    if (this.getCurrentContextState() === CurrentContextState.ShowResult) {
      setTimeout(() => this.setEnableVotingForParticipant(), this.resultAppearanceTime);
      return;
    }

    this.setEnableVotingForParticipant();
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
      this.getCurrentContextState() === CurrentContextState.PerformerInAction;
  }

  private someoneElseFinishedTheAction(speachRunning: boolean, currentSpeaker: string): boolean {
    return !speachRunning && currentSpeaker !== this.authService.userUid;
  }
}
