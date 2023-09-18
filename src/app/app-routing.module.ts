import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'graph',
    loadChildren: () => import('./components/graph/graph.module').then(m => m.GraphModule),
    data: {
      title: 'Graph'
    }
  },  {
    path: 'mapping',
    loadChildren: () => import('./components/mapping/mapping.module').then(m => m.MappingModule),
    data: {
      title: 'Mapping'
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
