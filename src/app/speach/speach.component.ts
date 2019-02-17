import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-speach',
  templateUrl: './speach.component.html',
  styleUrls: ['./speach.component.scss']
})
export class SpeachComponent implements OnInit {
  private connected: Observable<boolean | null>;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    this.connected = this.db.object<boolean>('connected').valueChanges();
  }

}
