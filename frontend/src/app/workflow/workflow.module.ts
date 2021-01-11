import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { DefineWorkflowComponent } from './define-workflow/define-workflow.component';


@NgModule({
  declarations: [DefineWorkflowComponent],
  imports: [
    CommonModule,
    WorkflowRoutingModule
  ]
})
export class WorkflowModule { }
