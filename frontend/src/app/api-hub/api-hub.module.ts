import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiHubRoutingModule } from './api-hub-routing.module';
// import { DefineApiComponent } from './define-api/define-api.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiHubService } from '../services/api-hub.service';
import { DefineStandardApiDefinitionComponent } from './define-standard-api-definition/define-standard-api-definition.component';
import { DefineApiComponent } from './define-api/define-api.component';

@NgModule({
  declarations: [
    DefineStandardApiDefinitionComponent,
    DefineApiComponent
    // DefineApiComponent
  ],
  imports: [
    CommonModule,
    ApiHubRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ApiHubModule { }

