import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Injectable()
export class ChartService {
  private readonly data = [3.5, 3, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
    3.7, 3.4, 3, 3, 4, 4.4, 3.9, 3.5, 3.8, 3.8, 3.4, 3.7, 3.6, 3.3,
    3.4, 3, 3.4, 3.5, 3.4, 3.2, 3.1, 3.4, 4.1, 4.2, 3.1, 3.2, 3.5,
    3.6, 3, 3.4, 3.5, 3.5, 3, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1,
    3.7, 3.4, 3, 3, 4, 4.4, 3.9, 3.5, 3.8, 3.8, 3.4, 3.7, 3.6, 3.3,
    3.4, 3, 3.4, 3.5, 3.4, 3.2, 3.1, 3.4, 4.1, 4.2, 3.1, 3.2, 3.5,
    3.6, 3, 3.4, 3.5];

  private chart = new Chart({
    title: {
      text: 'Reaction in time'
    },
    xAxis: [{
      title: {text: 'Time'},
      alignTicks: false
    }],

    yAxis: [{
      title: {text: ''},
    }],

    series: [ {
      name: 'single click',
      type: 'scatter',
      data: this.data,
      id: 's1',
      marker: {
        radius: 2.5
      }
    }]
  });


  getChart(): Chart {
    return this.chart;
  }
}
