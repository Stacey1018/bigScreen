import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontDataViewComponent } from './front-data-view';
import { FrontSceneViewComponent } from './front-scene-view';
import { LeaveSceneDataViewGuard } from '../../services/router/leaveSceneDataView.guard';

const routes: Routes = [
  {
    path: 'createScene',
    component: FrontDataViewComponent,
    canDeactivate: [LeaveSceneDataViewGuard]
  }, {
    path: 'sceneView',
    component: FrontSceneViewComponent
  }, {
    path: '',
    component: FrontSceneViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontRoutingModule { }

