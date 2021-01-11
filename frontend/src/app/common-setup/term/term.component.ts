import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import Swal from 'sweetalert2';

declare const $: any;


@Component({
  selector: 'app-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.sass']
})
export class TermComponent implements OnInit {

  termForm: FormGroup;
  submitted = false;
  BTN_VAL = 'Submit';
  token: string;
  APPLICATION_ID: string;
  SUB_APPLICATION_ID: string;
  USERID: string;
  termdata = [];

  constructor(private formBuilder: FormBuilder, private commonSetupService: CommonSetupService, private dynamicScriptLoader: DynamicScriptLoaderService) { }

  ngOnInit() {
    this.showList();
    this.token = localStorage.getItem('token');
    this.APPLICATION_ID = localStorage.getItem('APPLICATION_ID');
    this.USERID = localStorage.getItem('ID');
    this.SUB_APPLICATION_ID = localStorage.getItem('SUB_APPLICATION_ID');

    this.termForm = this.formBuilder.group({
      term_code: ['', Validators.required],
      term_description: ['', Validators.required],
      ID: [''],
      application_id: [this.APPLICATION_ID],
      sub_application_id: [this.SUB_APPLICATION_ID],
      USERID: [this.USERID],
      created_by: [this.USERID],
      updated_date_time: [Date]
    });

    this.commonSetupService.getTermData().subscribe((data: []) => {
      this.termdata = data.filter(function (data: any) {
        return data.is_deleted == 'N';
      });
    });

    'use strict';
    this.startScript();

  }

  //Setting up the edit environment
  editTermData(term) {
    this.termForm.patchValue({
      term_code: term.term_code,
      term_description: term.term_description,
      ID: term.id,
      updated_date_time: new Date(),
    });
    this.BTN_VAL = 'Update';

    var id = $("#ID").val();
    if (id != '') {
      $("#new_entry_form").show();
      $("#new_entry_title").show();
      $("#btn_list").hide();
      $("#btn_new_entry").hide();
      $("#list_form").hide();
      $("#list_title").hide();
    }
  }

  cancelForm(){
    this.termForm.reset({
      sub_application_id: [this.SUB_APPLICATION_ID],
      ID: [''],
      application_id: [this.APPLICATION_ID],
      USERID: [this.USERID],
      updated_date_time: [Date]
    });
    this.showList()
  }

  deleteTermData(value: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        value.is_deleted = 'Y';
        value.ID = value.id;
        this.commonSetupService.deleteTermData(value)
          .subscribe((data: any) => {
            if (data.status == 1) {
              this.termdata.splice(
                this.termdata.findIndex(data => data.id === value.ID)
              );
              Swal.fire(
                'Deleted!',
                'Your imaginary file has been deleted.',
                'success'
              )
            }
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })
  }

  async startScript() {
    await this.dynamicScriptLoader.load('dataTables.buttons', 'buttons.flash', 'jszip', 'buttons.html5', 'buttons.print').then(data => {
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
  }

  // private loadData() {
  //   $('#tableExport').DataTable({
  //     dom: 'Bfrtip',
  //     buttons: [
  //       'copy', 'csv', 'excel', 'pdf', 'print'
  //     ]
  //   });

  //   $("#new_entry_form").hide();
  //   $("#new_entry_title").hide();
  //   $("#btn_list").hide();
  // }

  showNewEntry() {
    $("#list_form").hide();
    $("#list_title").hide();
    $("#btn_new_entry").hide();
    $("#btn_list").show();
    $("#new_entry_form").show();
    $("#new_entry_title").show();
  }

  showList() {
    $('#tableExport').show();
    $("#list_form").show();
    $("#list_title").show();
    $("#btn_new_entry").show();
    $("#btn_list").hide();
    $("#new_entry_form").hide();
    $("#new_entry_title").hide();
  }

  // convenience getter for easy access to form fields
  get f() { return this.termForm.controls; }

  onSubmit(event: Event) {
    event.preventDefault()
    this.submitted = true;

    // stop here if form is invalid
    if (this.termForm.invalid) {
      return;
    }
    else {
      this.commonSetupService.saveTermData(this.termForm.value)
        .subscribe((data: any) => {
          //Addition of new data
          if (data.status == 1) {
            this.showList();
            this.termdata.push(data);
            Swal.fire('Your record has been added successfully!');
          }
          //Updating data
          if (data.status == 2) {
            this.showList();
            this.termdata[this.termdata.findIndex(item => item.id == data.id)] = data;
            Swal.fire('Your record has been updated successfully!',);
          }
          // setTimeout(function () { location.href = 'http://127.0.0.1:4200/#/common-setup/term' }, 2000);
        },
          error => {
            //Failure
            console.log(error);
            Swal.fire('Record Already Exists')

          });

    }
    this.BTN_VAL = 'Submit';
  }

}
