import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

const animationMs = 900;
export enum TimeListIndex {
  days = 0,
  hours = 1,
  min = 2,
  sec = 3
}
export interface TimeItem {
  value: string;
  label: string;
  lastValue: string;
  key: string;
  order: number
}

export enum UrlAcceptedParams {
  days = "daysToLaunch",
  hours = "hoursToLaunch",
  mins = "minutesToLaunch"
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('flipNumber', [
      state('flipTopNumberInAnimated', style({ transform: 'rotateX(0deg) ' })),
      state('flipTopNumberAnimated', style({ transform: 'rotateX(-180deg) ' })),
      transition('flipTopNumberInAnimated => flipTopNumberAnimated', animate(`${animationMs}ms cubic-bezier(0.4, 0.0, 0.2, 1)`)),
      state('flipBottomNumberInAnimated', style({ transform: 'rotateX(180deg)', 'transform-origin': 'top' })),
      state('flipBottomNumberAnimated', style({ transform: 'rotateX(0deg)', 'transform-origin': 'top' })),
      transition('flipBottomNumberInAnimated => flipBottomNumberAnimated', animate(`${animationMs}ms cubic-bezier(0.4, 0.0, 0.2, 1)`)),
      state('middleIndicatorInAnimated', style({ opacity: '1' })),
      state('middleIndicatorAnimated', style({ opacity: '0', })),
      transition('middleIndicatorInAnimated => middleIndicatorAnimated', animate(`${animationMs}ms cubic-bezier(0.4, 0.0, 0.2, 1)`)),
    ])
  ],
})
export class AppComponent implements OnInit {

  displayCountdown: TimeItem[] = [
    {
      value: '00',
      lastValue: '00',
      label: 'days',
      key: 'days',
      order: 1
    },
    {
      value: '00',
      lastValue: '00',
      label: 'hours',
      key: 'hours',
      order: 2
    },
    {
      value: '00',
      lastValue: '00',
      label: 'minutes',
      key: 'min',
      order: 3
    },
    {
      value: '00',
      lastValue: '00',
      label: 'seconds',
      key: 'sec',
      order: 4
    }
  ];
  public resetAnimation = false;
  private launchReady = false;
  private daysToLaunch = 1;
  private hoursToLaunch = 10;
  private minutesToLaunch = 2;
  private launchDateTime = new Date();
  private nowDateTime = new Date();

  currentValue = 9;
  lastValue = 0;
  ngOnInit() {

    this.processUrlParams();
    this.launchDateTime.setDate(this.launchDateTime.getDate() + this.daysToLaunch);
    this.launchDateTime.setHours(this.launchDateTime.getHours() + this.hoursToLaunch);
    this.launchDateTime.setMinutes(this.launchDateTime.getMinutes() + this.minutesToLaunch);
    this.calculateDisplayValues();
    setTimeout(() => {
      this.updateTime();
    });
  }

  private processUrlParams() {
    // Use location because the angular is running with no router to make it lighter
    const urlParams = location.search.split('?')[1] ? location.search.split('?')[1].split('&') : [];

    urlParams.forEach((param: string) => {
      const values = param.split('=');
      if (values.length > 1) {
        const intValue = parseInt(values[1]);
        switch (values[0].toLowerCase()) {
          case UrlAcceptedParams.days.toLowerCase():
            this.daysToLaunch = intValue >= 0 && intValue < 30 ? intValue : 1;
            break;
          case UrlAcceptedParams.hours.toLowerCase():
            this.hoursToLaunch = intValue >= 0 && intValue < 24 ? intValue : 1;
            break;
          case UrlAcceptedParams.mins.toLowerCase():
            this.minutesToLaunch = intValue > 0 && intValue < 60 ? intValue : 1;
            break;
        }
      }
    })
  }
  private updateTime() {
    this.launchDateTime.setSeconds(this.launchDateTime.getSeconds() - 1);
    this.calculateDisplayValues();
    this.resetAnimation = true;
    setTimeout(() => {
      if (!this.launchReady) {
        this.updateTime();
      }
    }, 1000);
  }

  private calculateDisplayValues() {
    const diff = this.launchDateTime.getTime() - this.nowDateTime.getTime();
    if (diff > 0) {
      const day = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((diff % (1000 * 60)) / 1000);

      this.displayCountdown[TimeListIndex.days].lastValue = this.displayCountdown[TimeListIndex.days].value;
      this.displayCountdown[TimeListIndex.hours].lastValue = this.displayCountdown[TimeListIndex.hours].value;
      this.displayCountdown[TimeListIndex.min].lastValue = this.displayCountdown[TimeListIndex.min].value;
      this.displayCountdown[TimeListIndex.sec].lastValue = this.displayCountdown[TimeListIndex.sec].value;

      this.displayCountdown[TimeListIndex.days].value = day < 10 ? `0${day}` : `${day}`;
      this.displayCountdown[TimeListIndex.hours].value = hours < 10 ? `0${hours}` : `${hours}`;
      this.displayCountdown[TimeListIndex.min].value = min < 10 ? `0${min}` : `${min}`;
      this.displayCountdown[TimeListIndex.sec].value = sec < 10 ? `0${sec}` : `${sec}`;

      setTimeout(() => {
        this.resetAnimation = false;
        this.displayCountdown[TimeListIndex.days].lastValue = this.displayCountdown[TimeListIndex.days].value;
        this.displayCountdown[TimeListIndex.hours].lastValue = this.displayCountdown[TimeListIndex.hours].value;
        this.displayCountdown[TimeListIndex.min].lastValue = this.displayCountdown[TimeListIndex.min].value;
        this.displayCountdown[TimeListIndex.sec].lastValue = this.displayCountdown[TimeListIndex.sec].value;

      }, animationMs);
    } else {
      this.launchReady = true;
    }
  }
}
