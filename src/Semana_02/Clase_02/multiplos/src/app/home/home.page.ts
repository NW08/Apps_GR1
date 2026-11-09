import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    CommonModule,
  ],
})
export class HomePage {
  one = 0;
  two = 0;
  three = 0;
  four = 0;
  five = 0;
  temp = 0;
  actual: number = 0;
  numbers: number[] = [];
  flag = false;

  primos() {
    if (this.one > 0) {
      this.temp = this.one;
    }
    while (this.flag === false) {
      let result = 0;
      result = this.multiples(this.temp + 1, 2);
      if (result === 0) {
        this.temp++;
      } else {
        this.one = result;
        this.flag = true;
      }
    }
    this.flag = false;
    if (this.two > 0) {
      this.temp = this.two;
    } else this.temp = 0;
    while (this.flag === false) {
      let result = 0;
      result = this.multiples(this.temp + 1, 3);
      if (result === 0) {
        this.temp++;
      } else {
        this.two = result;
        this.flag = true;
      }
    }
    this.flag = false;
    if (this.three > 0) {
      this.temp = this.three;
    } else this.temp = 0;

    while (this.flag === false) {
      let result = 0;
      result = this.multiples(this.temp + 1, 5);
      if (result === 0) {
        this.temp++;
      } else {
        this.three = result;
        this.flag = true;
      }
    }
    this.flag = false;
    if (this.four > 0) {
      this.temp = this.four;
    } else this.temp = 0;
    while (this.flag === false) {
      let result = 0;
      result = this.multiples(this.temp + 1, 7);
      if (result === 0) {
        this.temp++;
      } else {
        this.four = result;
        this.flag = true;
      }
    }
    this.flag = false;
    if (this.five > 0) {
      this.temp = this.five;
    } else this.temp = 0;

    while (this.flag === false) {
      let result = 0;
      result = this.multiples(this.temp + 1, 10);
      if (result === 0) {
        this.temp++;
      } else {
        this.five = result;
        this.flag = true;
      }
    }
    this.flag = false;

    if (this.numbers.length === 0) {
      this.temp = 2;
    } else this.temp = this.numbers[this.numbers.length - 1] + 1;

    while (this.flag === false) {
      if (this.logic(this.temp) === 0) {
        this.temp++;
      } else {
        this.actual = this.temp;
        this.flag = true;
      }
    }
    if (this.numbers.length >= 5) {
      this.numbers.shift(); // elimina el primero
    }
    this.numbers.push(this.actual);
    this.flag = false;
    this.temp = 0;
  }

  multiples(value: number, divisor: number): number {
    if (value > 0 && value % divisor === 0) return value;
    return 0;
  }

  logic(value: number): number {
    let isPrime = false;
    let count = 0;
    for (let i = value; i > 0; i--) {
      if (value % i === 0) {
        count++;
      }
    }
    if (count === 2) {
      isPrime = true;
    } else isPrime = false;

    return isPrime ? value : 0;
  }

  reiniciar() {
    this.one = 0;
    this.two = 0;
    this.three = 0;
    this.four = 0;
    this.five = 0;
    this.temp = 0;
    this.numbers = [];
    this.flag = false;
  }
}
