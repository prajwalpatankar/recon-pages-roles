import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { AssignRolesComponent } from './assign-roles/assign-roles.component';



const routes: Routes = [
  {
    path: 'left-panel', 
    component: LeftPanelComponent
  },
  {
    path: 'assign-roles', 
    component: AssignRolesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageSecurityRoutingModule { }
