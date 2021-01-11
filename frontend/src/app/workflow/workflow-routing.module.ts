import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DefineWorkflowComponent } from './define-workflow/define-workflow.component';

const routes: Routes = [
  {
    path : 'define_workflow',
    component : DefineWorkflowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule { }
