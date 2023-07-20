import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestingComponent } from './testing/testing.component';
import { GraphComponent } from './graph/graph.component';

const routes: Routes = [
  {
    path: 'testing',
    component: TestingComponent
  },
  {
    path: 'flow',
    component: GraphComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraphRoutingModule { }
