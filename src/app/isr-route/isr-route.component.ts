import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';

const stateKey = makeStateKey<number>('random');

@Component({
  selector: 'app-isr-route',
  templateUrl: './isr-route.component.html',
  styleUrls: ['./isr-route.component.css'],
})
export class IsrRouteComponent {
  random: number;

  constructor(transferState: TransferState, @Inject(PLATFORM_ID) id: string) {
    // Angular Universal does not have a hydration mechanism yet to preserve initial values,
    // so we do a poor man's version here to showcase ISR in fact works.
    if (isPlatformBrowser(id)) {
      this.random = transferState.get(stateKey, -1);
    } else {
      this.random = Math.random();
      transferState.set(stateKey, this.random);
    }
  }
}
