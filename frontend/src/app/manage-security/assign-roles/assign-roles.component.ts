import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReconcilationService } from 'src/app/services/reconcilation.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../global/global-constants';

import { ManageSecurityService } from 'src/app/services/manage-security.service';
declare const $: any;

@Component({
  selector: 'app-assign-roles',
  templateUrl: './assign-roles.component.html',
  styleUrls: ['./assign-roles.component.sass']
})

export class AssignRolesComponent implements OnInit {

  // @ViewChild('roleTemplate', { static: true }) roleTemplate: TemplateRef<any>;
  
  frontEndUrl = GlobalConstants.frontEndUrl;

  roleRefdata = [];
  roledata = [];
  roledatanew = [];
  formrefdata = [];
  pagesOfLeftPanel = [];
  childsOfLeftPanel = [];
  parentsOfLeftPanel = [];
  childsOfLeftPanellist = [];
  parentsOfLeftPanellist = [];
  companyrefdata = [];
  formrefdataspecific = [];
  read_access: [];
  write_edit_access: [];
  delete_access: [];
  i: number;
  j: number;
  rolesForm: FormGroup;

  hide = true;
  agree = true;
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
    $('#list_form').hide();
    $('#list_title').hide();
    $('#btn_new_entry').hide();
    $('#btn_list').show();
    $('#new_entry_form').show();
    $('#new_entry_title').show();
    this.rolesForm = this.fb.group({
      company_ref_id: [null, Validators.required],
      form_ref_id: [null, Validators.required],
      read_access: [null,Validators.required],
      write_edit_access: [null,Validators.required],
      delete_access: [null,Validators.required],
      assigned_to_role :[''],
      id: [''],
      parent_code: [''],
      child_code: [''],
      sub_child_code: [''],
      updated_date_time: [Date],
      // form_name : ['',[Validators.required, Validators.pattern('[a-zA-Z]+')]],
      // form_link : [''],
      // is_parent : [''],
      // is_child : [''],
      // is_sub_child : [''],
      // parent_code : ['',[Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      // child_code : [''],
      // sub_child_code : [''],
      // icon_class : [''],
      // sequence_id : ['',[Validators.required, Validators.pattern('[0-9]+')]],
      sub_application_id: [this.SUB_APPLICATION_ID],
      application_id: [this.APPLICATION_ID],
      created_by: [this.CREATED_BY],
    });




    this.manageSecurityService.getRolesData().subscribe((data: []) => {
      this.roledata = data.filter(function (data: any) {
        //Only get records which are not deleted
        return data.is_deleted == 'N';
      });

    });

    this.manageSecurityService.getFormRefData().subscribe((data: []) => {
      this.formrefdata = data;
      this.pagesOfLeftPanel = data.filter(function (data: any) {
        //Only get records which are pages
        return data.is_sub_child == 'Y';
      });
      this.childsOfLeftPanellist = data.filter(function (data: any) {
        //Only get records which are pages
        return data.is_child == 'Y';
      });
      this.parentsOfLeftPanellist = data.filter(function (data: any) {
        //Only get records which are pages
        return data.is_parent == 'Y';
      });

      for(this.i=0; this.i<this.pagesOfLeftPanel.length; this.i++) {
        for(this.j=0; this.j<this.parentsOfLeftPanellist.length; this.j++) {
          if(this.pagesOfLeftPanel[this.i].parent_code == this.parentsOfLeftPanellist[this.j].parent_code)
          {
            this.pagesOfLeftPanel[this.i].parent = this.parentsOfLeftPanellist[this.j].form_name;
          }
        }
      }

      for(this.i=0; this.i<this.pagesOfLeftPanel.length; this.i++) {
        for(this.j=0; this.j<this.childsOfLeftPanellist.length; this.j++) {
          if(this.pagesOfLeftPanel[this.i].child_code == this.childsOfLeftPanellist[this.j].child_code)
          {
            this.pagesOfLeftPanel[this.i].child = this.childsOfLeftPanellist[this.j].form_name;
          }
        }
      }

      for(this.i=0; this.i<this.pagesOfLeftPanel.length; this.i++) {
        this.pagesOfLeftPanel[this.i].foundflag =0;
        for(this.j=0; this.j<this.roledata.length; this.j++) {
          if(this.pagesOfLeftPanel[this.i].sub_child_code == this.roledata[this.j].sub_child_code){
            
            this.pagesOfLeftPanel[this.i].foundflag = 1;
            
            if (this.roledata[this.j].read_access == 'Y'){
              this.pagesOfLeftPanel[this.i].read_access = true;
            }
            else {
              this.pagesOfLeftPanel[this.i].read_access = false;
            }
            if (this.roledata[this.j].write_edit_access == 'Y'){
              this.pagesOfLeftPanel[this.i].write_edit_access = true;
            }
            else {
              this.pagesOfLeftPanel[this.i].write_edit_access = false;
            }
            if (this.roledata[this.j].delete_access == 'Y'){
              this.pagesOfLeftPanel[this.i].delete_access = true;
            }
            else {
              this.pagesOfLeftPanel[this.i].delete_access = false;
            }

            this.pagesOfLeftPanel[this.i].role_id = this.roledata[this.j].id;

            
          }
        }
        if(this.pagesOfLeftPanel[this.i].foundflag == 0 ){
          
          this.pagesOfLeftPanel[this.i].read_access = false;
          this.pagesOfLeftPanel[this.i].write_edit_access = false;
          this.pagesOfLeftPanel[this.i].delete_access = false;
        }
      }
      console.log("pages of left panel");
      console.log(this.pagesOfLeftPanel);

      // for(this.i=0; this.i<this.pagesOfLeftPanel.length; this.i++) {
      //   this.parentsOfLeftPanel[this.i] = data.filter(function (data: any) {
      //     //Only get records which are pages
      //     return data.parent_code == this.pagesOfLeftPanel[this.i].parent_code;;
      //   });
      // }
      //   for(this.i=0; this.i<this.pagesOfLeftPanel.length; this.i++) {
      //     this.childsOfLeftPanel[this.i] = data.filter(function (data: any) {
      //       //Only get records which are pages
      //       return data.child_code == this.pagesOfLeftPanel[this.i].child_code;;
      //     });
      // }
    });

    
    this.manageSecurityService.getRoleRefData().subscribe((data: []) => {
      this.roleRefdata = data.filter(function (data: any) {
        //Only get records which are not deleted
        return data.is_deleted == 'N';
      });
    });

    this.manageSecurityService.getCompanyRefData().subscribe((data: []) => {
      this.companyrefdata = data;
    });


  }

  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;

  constructor(private fb: FormBuilder,private manageSecurityService:ManageSecurityService,private commonSetupService: CommonSetupService,private reconcilationService: ReconcilationService,private dynamicScriptLoader: DynamicScriptLoaderService,private _snackBar: MatSnackBar) {  
  }
  
  get f() { return this.rolesForm.controls; }


  onChange(row) {
    console.log(row);
  }

  onSubmit() {
    console.log('Value :::::  ', this.rolesForm.value);
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

    $('#btn_list').show();
    $('#new_entry_form').show();
    $('#new_entry_title').show();
    this.BTN_VAL = 'Submit';
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


  saveRowData(row) {
    console.log('Form Value', this.rolesForm.value);
    this.submitted = true;

    if(row.read_access)
      this.rolesForm.value.read_access = 'Y';
    else
      this.rolesForm.value.read_access = 'N';
    
    if(row.write_edit_access)
      this.rolesForm.value.write_edit_access = 'Y';
    else
      this.rolesForm.value.write_edit_access = 'N';
      
    if(row.delete_access)
      this.rolesForm.value.delete_access = 'Y';
    else
      this.rolesForm.value.delete_access = 'N';

    this.rolesForm.value.parent_code = row.parent;
    this.rolesForm.value.child_code = row.child;
    this.rolesForm.value.sub_child_code = row.form_name;
    this.rolesForm.value.form_ref_id = row.id;
    this.rolesForm.value.created_by = 0;


    for(this.i=0;this.i<this.roledata.length;this.i++){
      if(this.rolesForm.value.assigned_to_role == this.roledata[this.i].assigned_to_role && this.rolesForm.value.sub_child_code == this.roledata[this.i].sub_child_code) {
        this.rolesForm.value.id = this.roledata[this.i].id;
      }
    }
      

    console.log('Form Value', this.rolesForm.value);
  
      if (!this.rolesForm.value.assigned_to_role && !this.rolesForm.value.company_ref_id) {
        console.log("Blank Fields")
        return;
      } else {
        this.manageSecurityService.saveRolesData(this.rolesForm.value).subscribe((data: any) => {
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
        },
          (error: any) => {
            // console.log("ERROR",error.error.split(" ")[0])
            console.log("ERRRRROR", error)
            // console.log("sub_application_id:",this.rolesForm)
  
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

  deleteRowData(id){
    this.manageSecurityService.deleteRoles(id).subscribe((data:any)=>{
      // if (data == 1) {
        Swal.fire({
          title: 'Your record has been deleted successfully!',
          icon: 'warning',
          showConfirmButton: false
        });
    // }
    let exact_frontEndUrl = this.frontEndUrl + "/#/manage-security/assign-roles";
    setTimeout(function(){location.href= exact_frontEndUrl} , 2000);
    });
  }


}
