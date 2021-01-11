import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReconcilationService } from 'src/app/services/reconcilation.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { ManageSecurityService } from 'src/app/services/manage-security.service';
declare const $: any;

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.sass']
})
export class LeftPanelComponent implements OnInit {

  @ViewChild('roleTemplate', { static: true }) roleTemplate: TemplateRef<any>;
  
  register: FormGroup;
  hide = true;
  agree = false;
  checked = false;

  leftPanelData: any = [];
  BTN_VAL = 'Submit';
  submitted = false;
  APPLICATION_ID: string;
  SUB_APPLICATION_ID: string;
  CREATED_BY: string;
  tbl_columns = [
    { name: 'Form Name' },
    { name: 'Form Link' },
    { name: 'Is Parent' },
    { name: 'Is Child' },
    { name: 'Is Sub Child' },
    { name: 'Parent Code' },
    { name: 'Child Code' },
    { name: 'Sub Child Code' },
    { name: 'Icon class' },
    { name: 'Sequence Id' },
  ];
  tbl_data = [];
  tbl_FilteredData = [];
  ngOnInit(): void {
    this.APPLICATION_ID = localStorage.getItem('APPLICATION_ID');
    this.SUB_APPLICATION_ID = localStorage.getItem('SUB_APPLICATION_ID');
    this.CREATED_BY = localStorage.getItem('ID');
    this.startScript();
    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
    this.register = this.fb.group({
      form_name : ['',[Validators.required, Validators.pattern('[a-zA-Z]+')]],
      form_link : [''],
      is_parent : [''],
      is_child : [''],
      is_sub_child : [''],
      parent_code : ['',[Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      child_code : [''],
      sub_child_code : [''],
      icon_class : [''],
      sequence_id : ['',[Validators.required, Validators.pattern('[0-9]+')]],
      termcondition: [false],
      sub_application_id: [this.SUB_APPLICATION_ID],
      application_id: [this.APPLICATION_ID],
      created_by: [this.CREATED_BY],
    });
  }

  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;

  constructor(private fb: FormBuilder,private manageSecurityService:ManageSecurityService,private commonSetupService: CommonSetupService,private reconcilationService: ReconcilationService,private dynamicScriptLoader: DynamicScriptLoaderService,private _snackBar: MatSnackBar) {
    this.manageSecurityService.getLeftPanelData().subscribe((data: []) => {
      this.leftPanelData = data;
    });
    
  }
  
  onRegister() {
    console.log('Form Value', this.register.value);
    this.submitted = true;
  
      if (this.register.invalid) {
        return;
      } else {
        this.manageSecurityService.saveLeftPanelData(this.register.value).subscribe((data: any) => {
        console.log("In save function ");
        console.log(data);
          if (data.status === 1) {
            Swal.fire({
              icon: 'success',
              title: 'Your record has been added successfully!',
              showConfirmButton: false,
              timer: 2000
            });
            //this.ActivityData.push(data);
          }
        
          if (data.status === 2) {
            Swal.fire({
              title: 'Your record has been updated successfully!',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
          if (data == 0) {
            Swal.fire({
              title: 'Record Already Exist!',
              icon: 'warning',
              timer: 2000,
              showConfirmButton: false
            });
          }
          setTimeout(function(){location.href='http://localhost:4200/#/manage-security/left-panel'} , 2000);
        },
          (error: any) => {
            // console.log("ERROR",error.error.split(" ")[0])
            console.log("ERRRRROR", error)
            console.log("sub_application_id:",this.register)
  
            //Error Meassage
            let message=""
            try
            {
              //Get the error message from exception thrown by the django
              message=error.error.substring(1,100) 
            }catch(err){
              console.log(err)
            }
            if(message.includes("form_name")){
            // if (error.error.currency_code) {
              Swal.fire({
                title: 'Location Name Already Exist!',
                icon: 'warning',
                showConfirmButton: false
              });
            }
            else{
              Swal.fire({
                title: "Server Error",
                icon: 'warning',
                showConfirmButton: false
              });
            }
          });
      }
  }

  tbl_FilterDatatable(event) {
    // get the value of the key pressed and make it lowercase
    const val = event.target.value.toLowerCase();
    // get the amount of columns in the table
    const colsAmt = this.tbl_columns.length;
    // get the key names of each column in the dataset
    const keys = Object.keys(this.tbl_FilteredData[0]);
    // assign filtered matches to the active datatable
    this.leftPanelData = this.tbl_FilteredData.filter(function(item) {
      // iterate through each row's column data
      for (let i = 0; i < colsAmt; i++) {
        // check for a match
        if (
          item[keys[i]]
            .toString()
            .toLowerCase()
            .indexOf(val) !== -1 ||
          !val
        ) {
          // found match, return true to add to result set
          return true;
        }
      }
    });
    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async startScript() {
    console.log("In startScript");
    // tslint:disable-next-line:max-line-length
    await this.dynamicScriptLoader.load('form.min', 'bootstrap-colorpicker', 'dataTables.buttons', 'buttons.flash', 'jszip', 'buttons.html5', 'buttons.print').then(data => {
      this.loadData();
    }).catch(error => console.log(error));
  }

  private loadData() {
    $(".select2").select2();
    $('#tableExport').DataTable({
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
      ]
    });

    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
    $('#btn_list').hide();
  }
  showNewEntry() {
    $('#list_form').hide();
    $('#list_title').hide();
    $('#btn_new_entry').hide();
    $('#btn_list').show();
    $('#new_entry_form').show();
    $('#new_entry_title').show();
    this.BTN_VAL = 'Submit';
  }

  showList() {
    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
    this.submitted = false;
  }

  editLeftPanelData(location) {
    this.register.patchValue({
      form_name : location.form_name,
      form_link : location.form_link,
      is_parent : location.is_parent,
      is_child : location.is_child,
      is_sub_child : location.is_sub_child,
      parent_code : location.parent_code,
      child_code : location.child_code,
      sub_child_code : location.sub_child,
      icon_class : location.icon_class,
      sequence_id : location.sequence_id,
      id: location.id,
    });
  
    this.BTN_VAL = 'Update';
    const id = $('#id').val();
  
    if (id !== '') {
      $('#new_entry_form').show();
      $('#new_entry_title').show();
      $('#btn_list').hide();
      $('#btn_new_entry').hide();
      $('#list_form').hide();
      $('#list_title').hide();
    }
  }

  
  deleteRowData(id){
    this.manageSecurityService.deleteLeftPanelData(id).subscribe((data:any)=>{
      if (data == 1) {
        Swal.fire({
          title: 'Your record has been deleted successfully!',
          icon: 'warning',
          showConfirmButton: false
        });
    }
  setTimeout(function(){location.href='http://localhost:4200/#/manage-security/left-panel'} , 2000);
    });
    
  }

}