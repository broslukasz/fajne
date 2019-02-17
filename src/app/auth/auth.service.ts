import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<firebase.User | null>;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.user$ = this.afAuth.authState;
  }

  login(): void {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => this.router.navigate(['speach']))
      .catch(error => console.log('auth error', error));
  }
  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate(['']);
  }
}
