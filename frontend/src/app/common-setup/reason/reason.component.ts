import { Component, OnInit,  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import Swal from 'sweetalert2'; 

declare const $: any;
//declare const swal: any;

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.sass'],
  providers: [CommonSetupService]
})
export class ReasonComponent implements OnInit {

  rejectionreasonForm: FormGroup;
  submitted = false;
  BTN_VAL='Submit';
  rejectionreasondata = [];
  editid;
  edit_data;
  application_id: string;
  USERID: string;
  sub_application_id: string;

  // tslint:disable-next-line:max-line-length
  constructor(private formBuilder: FormBuilder,private commonSetupService: CommonSetupService,private dynamicScriptLoader: DynamicScriptLoaderService) { 
    
  }

  ngOnInit() {
    this.application_id = localStorage.getItem('APPLICATION_ID');
    this.USERID = localStorage.getItem('ID');
    this.sub_application_id = localStorage.getItem('SUB_APPLICATION_ID');
    this.rejectionreasonForm = this.formBuilder.group({
      rej_reason_code: ['', Validators.required],
      rej_reason: ['', Validators.required],
      ID: [''],
      application_id: [this.application_id],
      sub_application_id: [this.sub_application_id],
      USERID: [this.USERID]
    });
  
    this.commonSetupService.getRejectionReasonData().subscribe((data: []) => {
      this.rejectionreasondata = data.filter(function (data: any) {
        return data.is_deleted == 'N';
      });
    });

    'use strict';
    this.startScript();
  }

  editRejectionReasonData(rejectionreason){
    this.rejectionreasonForm.patchValue({
      rej_reason_code: rejectionreason.rej_reason_code,
      rej_reason: rejectionreason.rej_reason,
      ID: rejectionreason.id
    });
    this.BTN_VAL='Update';
    this.editid=rejectionreason.id
    this.rejectionreasonForm.controls.rej_reason_code.disable();

    var rej_reason_code=$("#rej_reason_code").val();

		if(rejectionreason.rej_reason_code!='')
		{
 			$("#new_entry_title").show();
			$("#btn_list").hide();
			$("#btn_new_entry").hide();
			$("#list_form").hide();
			$("#list_title").hide();
		}
  }

  deleteRejectionReasonData(value: any){
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        value.is_deleted = 'Y';
        this.commonSetupService.deleteReason(value).subscribe((data: any) => {
          if (data.status == 1) {
            this.rejectionreasondata.splice(
              this.rejectionreasondata.findIndex(data => data.id === value.id), 1
            )
            Swal.fire({
              title: 'Your record has been deleted successfully!',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }
    
  async startScript() {
    // tslint:disable-next-line:max-line-length
    await this.dynamicScriptLoader.load('form.min', 'bootstrap-colorpicker', 'dataTables.buttons', 'buttons.flash', 'jszip', 'buttons.html5', 'buttons.print').then(data => {
      this.loadData();
    }).catch(error => console.log(error));
  }

  private loadData() {
    $('#tableExport').DataTable({
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
      ]
    });

    $("#new_entry_form").hide();
    $("#new_entry_title").hide();
    $("#btn_list").hide();
  }

  showNewEntry()
  {
    $("#list_form").hide(); 
    $("#list_title").hide();
    $("#btn_new_entry").hide();
    $("#btn_list").show();
    $("#new_entry_form").show();
    $("#new_entry_title").show();
  }

	showList()
  {
    $("#list_form").show();
    $("#list_title").show();
    $("#btn_new_entry").show();
    $("#btn_list").hide();
    $("#new_entry_form").hide();
    $("#new_entry_title").hide();
  }

  // convenience getter for easy access to form fields
  get f() { return this.rejectionreasonForm.controls; }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    console.log(this.rejectionreasonForm.value);
    if (this.rejectionreasonForm.invalid) {
        return;
    }
    else{ 
      this.commonSetupService.saveReasonData(this.rejectionreasonForm.value).subscribe((data: any) => {
      
        //Insert Data
        if (data.status === 1) {
          Swal.fire({
            title: 'Your record has been added successfully!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.rejectionreasondata.push(data);
          this.showList()
        }
        //Update Data
        if (data.status === 2) {
          Swal.fire({
            title: 'Your record has been updated successfully!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          let index = this.rejectionreasondata.findIndex(item => item.id === data.id)
          this.rejectionreasondata[index] = data
          this.showList()
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
          console.log("sub_application_id:",this.rejectionreasonForm)

          //Error Meassage
          let message=""
          try
          {
            //Get the error message from exception thrown by the django
            message=error.error.substring(1,100) 
          }catch(err){
            console.log(err)
          }
          if(message.includes("currency_code")){
          // if (error.error.currency_code) {
            Swal.fire({
              title: 'Currency Code Already Exist!',
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

}
