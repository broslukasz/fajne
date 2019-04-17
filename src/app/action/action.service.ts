import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { FirebaseObject } from '../core/enums/firebase-object';
import { ContextAction } from './enums/context-action.enum';
import { CurrentContextState } from './enums/context-state.enum';
import { ButtonContextClass } from './enums/button-context-class.enum';
import { ActionButton } from './action-button';
import { isNullOrUndefined } from 'util';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ActionService implements OnDestroy {
  private readonly resultAppearanceTime: number = 3000;
  private actionButtonSource = new BehaviorSubject<ActionButton>(this.setWaitForConnectionState());
  private actionCounterSubscription: Subscription;

  actionCounter$: BehaviorSubject<number> = new BehaviorSubject(0);
  actionButton$: Observable<ActionButton> = this.actionButtonSource.asObservable();

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) { }

  ngOnDestroy(): void {
    this.actionCounterSubscription.unsubscribe();
  }

  getActionButtonReference(): Observable<ActionButton> {
    return this.actionButton$;
  }

  initializaActionCounter(): void {
    this.actionCounterSubscription = this.db.object<number>(FirebaseObject.ActionCounter)
      .valueChanges().subscribe((counterValue: number) => {
        this.actionCounter$.next(counterValue);
    });
  }

  loginAction(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart
    ));
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

  goToActionStartState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionStart,
      CurrentContextState.ActionStart,
      ButtonContextClass.ActionStart,
    ));
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

  private setWaitForConnectionState(): ActionButton {
    return ActionButton.changeContext(
      ContextAction.WaitForConnection,
      CurrentContextState.WaitForConnection,
      ButtonContextClass.WaitForConnection
    );
  }

  private startActionAsPerformer(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionForPerformer,
      CurrentContextState.PerformerInAction,
      ButtonContextClass.PerformerInAction
    ));
  }

  private goToThankYouState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ThankYouInformation,
      CurrentContextState.ThankYouInformation,
      ButtonContextClass.ThankYouInformation,
    ));
  }

  private goToShowResultState(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      this.actionCounter$.getValue(),
      CurrentContextState.ShowResult,
      ButtonContextClass.ShowResult,
    ));
  }

  private setEnableVotingForParticipant(): void {
    this.actionButtonSource.next(ActionButton.changeContext(
      ContextAction.ActionForParticipant,
      CurrentContextState.ParticipantInAction,
      ButtonContextClass.ParticipantInAction
    ));
  }

  private resetTheResult(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).set(0);
  }
}
