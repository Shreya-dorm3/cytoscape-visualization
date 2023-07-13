import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphRoutingModule } from './graph-routing.module';
import { TestingComponent } from './testing/testing.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    TestingComponent
  ],
  imports: [
    CommonModule,
    GraphRoutingModule,
    SharedModule
  ]
})
export class GraphModule { }
