import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fajne';
  connected: Observable<boolean>;

  constructor(private db: AngularFireDatabase) {}

  public ngOnInit(): void {
    this.connected = this.db.object<boolean>('connected').valueChanges();
  }
}
