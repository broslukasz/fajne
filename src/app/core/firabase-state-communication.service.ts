import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirabaseStateCommunicationService {
  public connected: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private db: AngularFireDatabase
  ) { }

  public initializaFirebaseStete(): void {
    this.db.object<boolean>('connected').valueChanges().subscribe((connected: boolean) => {
      this.connected.next(connected);
    });
  }
}
