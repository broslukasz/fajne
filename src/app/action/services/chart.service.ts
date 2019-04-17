import { Injectable, OnDestroy } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { FirebaseObject } from '../../core/enums/firebase-object';
import { Subscription } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class ChartService implements OnDestroy {
  private readonly chartData = [];

  private chart = new Chart({
    chart: {
      type: 'scatter',
      zoomType: 'xy'
    },
    title: {
      text: 'Reaction over time'
    },
    xAxis: {
      title: {
        text: 'Time'
      }
    },
    yAxis: {
      title: {
        text: ''
      }
    },
    series: [{
      name: 'All clicks',
      color: 'rgba(223, 83, 83, .5)',
      data: this.chartData,
      type: 'scatter'
    }]
  });

  private actionStartTime: number;
  private actionCounterSubscription: Subscription;

  constructor(
    private db: AngularFireDatabase
  ) { }

  ngOnDestroy(): void {
    this.actionCounterSubscription.unsubscribe();
  }


  getChart(): Chart {
    return this.chart;
  }

  setActionStartTime(startTime: number): void {
    this.actionStartTime = startTime;
  }

  initializaActionCounter(): void {
    this.actionCounterSubscription = this.db.object<number>(FirebaseObject.ActionCounter)
      .valueChanges().subscribe(() => {
        this.createReactionChartData();
      });
  }

  private createReactionChartData() {
    const currentTime: number = Date.now();
    const differenceInMinutes = (currentTime - this.actionStartTime) / 1000 / 60;

    this.chartData.push([differenceInMinutes, Math.random()]);
  }
}
