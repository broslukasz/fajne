import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject } from 'rxjs';
import { FirebaseObject } from '../core/enums/firebase-object';

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
}
