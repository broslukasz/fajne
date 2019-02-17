import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent implements OnInit {
  private connected: Observable<boolean | null>;
  contextAction = 'login';

  constructor(
    private db: AngularFireDatabase,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.connected = this.db.object<boolean>('connected').valueChanges();

    combineLatest(this.connected, this.authService.user$)
      .subscribe(([connected, authState]: [boolean, any]) => {

      })
  }

}
