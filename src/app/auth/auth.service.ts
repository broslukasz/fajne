import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase/app';
import { AuthModule } from './auth.module';

@Injectable({
  providedIn: AuthModule
})
export class AuthService {
  public user$: BehaviorSubject<firebase.User | null> = new BehaviorSubject(null);
  public userUid: string;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth
  ) { }

  login(): void {
    this.afAuth.auth.signInAnonymously()
      .then((credentials) => {
        this.userUid = credentials.user.uid;
        this.user$.next(credentials.user);
      })
      .catch(error => console.log('auth error', error));
  }

  logout(): void {
    this.afAuth.auth.signOut();
    console.log('user logged out in');
  }
}
