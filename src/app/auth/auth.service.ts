import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { AuthModule } from './auth.module';

@Injectable({
  providedIn: AuthModule
})
export class AuthService {
  private userSource: BehaviorSubject<firebase.User | null> = new BehaviorSubject(null);
  user$: Observable<firebase.User | null> = this.userSource.asObservable();
  userUid: string;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth
  ) { }

  login(): void {
    this.afAuth.auth.signInAnonymously()
      .then((credentials) => {
        this.userUid = credentials.user.uid;
        this.userSource.next(credentials.user);
      })
      .catch(error => console.log('auth error', error));
  }

  logout(): void {
    this.afAuth.auth.signOut();
    console.log('user logged out in');
  }

  getUser(): Observable<firebase.User | null> {
    return this.user$;
  }

  getUserValue(): firebase.User | null {
    return this.userSource.getValue();
  }
}
