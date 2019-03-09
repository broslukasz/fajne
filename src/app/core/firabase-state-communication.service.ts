import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseObject } from '../enums/firebase-object';

@Injectable({
  providedIn: 'root'
})
export class FirabaseStateCommunicationService {
  public loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public actionCounter$: BehaviorSubject<number> = new BehaviorSubject(0);
  public isResultAvailable$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private db: AngularFireDatabase
  ) { }

  public initializaFirebaseState(): void {
    this.db.object<number>(FirebaseObject.ActionCounter).valueChanges().subscribe((counterValue: number) => {
      this.actionCounter$.next(counterValue);
    });
  }
}
