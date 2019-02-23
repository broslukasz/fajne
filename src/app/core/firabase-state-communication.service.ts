import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseObject } from '../enums/firebase-object';

@Injectable({
  providedIn: 'root'
})
export class FirabaseStateCommunicationService {
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public actionCounter: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private db: AngularFireDatabase
  ) { }

  public initializaFirebaseStete(): void {
    this.db.object<boolean>(FirebaseObject.Connected).valueChanges().subscribe((connected: boolean) => {
      this.connected.next(connected);
    });

    this.db.object<number>(FirebaseObject.ActionCounter).valueChanges().subscribe((counterValue: number) => {
      this.actionCounter.next(counterValue);
    });
  }
}
