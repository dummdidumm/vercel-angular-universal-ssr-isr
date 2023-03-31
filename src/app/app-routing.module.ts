import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseRouteComponent } from './base-route/base-route.component';
import { AnotherRouteComponent } from './another-route/another-route.component';
import { IsrRouteComponent } from './isr-route/isr-route.component';

const routes: Routes = [
  {
    path: '',
    component: BaseRouteComponent,
  },
  {
    path: 'another-route',
    component: AnotherRouteComponent,
  },
  {
    path: 'isr-route',
    component: IsrRouteComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
