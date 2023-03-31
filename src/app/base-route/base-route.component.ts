import { Component } from '@angular/core';

@Component({
  selector: 'app-base-route',
  templateUrl: './base-route.component.html',
  styleUrls: ['./base-route.component.css'],
})
export class BaseRouteComponent {
  random = Math.random();
}
