import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiHubService } from 'src/app/services/api-hub.service';
import Swal from "sweetalert2";


declare const $: any;
// declare const swal: any;
declare const flatpickr: any;

@Component({
  selector: 'app-define-api',
  templateUrl: './define-api.component.html',
  styleUrls: ['./define-api.component.sass']
})
export class DefineApiComponent implements OnInit {

  defineApiHubForm: FormGroup;
  fromDateControl: FormControl;

  apiMasterData = [];
  companyData = [];
  channelData = [];
  selfChannelData = [];
  typeOfRequests = [];
  typeOfFields = [];
  btnValue = "Submit";
  todayDate = new Date().toJSON().split('T')[0];
  submitted = false;
  channel_ref_id = [];

  constructor(private formBuilder: FormBuilder, private apiHubService: ApiHubService) { }

  ngOnInit(): void {
    this.showList();

    this.defineApiHubForm = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      company_ref_id: ['', Validators.required],
      channel_ref_id: ['', Validators.required],
      self_channel_ref_id: ['', Validators.required],
      request_type_ref_id: ['', Validators.required],
      from_date: [this.fromDateControl, Validators.required],
      to_date: ['2099-12-31'],
      revision_status: ['', Validators.required],
      sub_application_id: "RHYTHMFLOWS",
      application_id: "RHYTHMFLOWS",
      initialItemRow: this.formBuilder.array([this.initialitemRow()])
    });

    this.defineApiHubForm.get("company_ref_id").valueChanges.subscribe(val => {
      this.channelData = [];
      if (val != "null") {
        this.apiHubService.getChannelAccCompanyData(val).subscribe((data: []) => {
          this.channelData = data['companies'] // companies here returns name of channel for the selected company
        });
        //this.channel_ref_id.enable();
      }
      else {
       // this.channel_ref_id.disable();
      }
    })

    // apimaster data
    this.apiHubService.getApiMasterData().subscribe(data => {
      this.apiMasterData = data;
    });

    // company data
    this.apiHubService.getCompanyData().subscribe(data => {
      this.companyData = data;
    });

    // channel data
    this.apiHubService.getChannelData('').subscribe(data => {
      this.selfChannelData = data;
    });

    this.apiHubService.getMasterData().subscribe(data => {
      this.typeOfRequests = data.filter(function (data: any) {
        return data.master_type == 'Type of Request for API';
      });

      this.typeOfFields = data.filter(function (data: any) {
        return data.master_type == 'Type of Field';
      });

    });

    this.defineApiHubForm.get("from_date").valueChanges.subscribe(val => {
      if (val != null) {
        if (val === this.todayDate) {
          this.defineApiHubForm.get("revision_status").setValue("Effective");
        } else {
          this.defineApiHubForm.get("revision_status").setValue("Future");
        }
      }
    });
  }

  showList() {
    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
  }

  showNewEntry() {
    $('#new_entry_form').show();
    $('#new_entry_title').show();
    $('#btn_list').show();
    $('#list_form').hide();
    $('#list_title').hide();
    $('#btn_new_entry').hide();
    this.submitted = false;
  }

  initialitemRow() {
    return this.formBuilder.group({
      id: [''],
      api_field_name: ['', Validators.required],
      api_field_data_type_ref_id: ['', Validators.required],
      api_field_length: ['', Validators.required],
      table_name: ['', Validators.required],
      field_name: ['', Validators.required],
      field_data_type_ref_id: ['', Validators.required],
      field_length: ['', Validators.required],
      sub_application_id: "RHYTHMFLOWS",
      application_id: "RHYTHMFLOWS",
    });
  }

  get formArr() {
    return this.defineApiHubForm.get('initialItemRow') as FormArray;
  }

  addNewRow() {
    this.formArr.push(this.initialitemRow());
  }

  deleteRow(index) {
    if (this.formArr.length == 1) {
      return false;
    } else {
      this.formArr.removeAt(index);
      return true;
    }
  }

  // getChannelData(companyRefId) {
  //   this.apiHubService.getChannelData(companyRefId).subscribe(data => {
  //     this.channelData = data;
  //   });
  // }

  get f() {
    return this.defineApiHubForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    this.apiHubService.saveApiHubData(this.defineApiHubForm.value).subscribe((data: any) => {
      if (data.status === 1) {
        Swal.fire({
          title: 'Your Record has been added successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

      }
      else if (data.status === 2) {
        Swal.fire({
          title: 'Your record has been updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
      else if (data.status === 0) {
        Swal.fire({
          title: 'Record Already Exist!',
          icon: 'warning',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setTimeout(function () { location.href = 'http://localhost:4200/#/api-hub/define-api'; }, 2000);
    });
  }

  setExistingArray(initialArray = []): FormArray {
    const formArray = new FormArray([]);
    initialArray.forEach(element => {
      formArray.push(this.formBuilder.group({
        id: element.id,
        api_field_name: element.api_field_name,
        api_field_data_type_ref_id: element.api_field_data_type_ref_id,
        api_field_length: element.api_field_length,
        table_name: element.table_name,
        field_name: element.field_name,
        field_data_type_ref_id: element.field_data_type_ref_id,
        field_length: element.field_length,
        application_id: "RHYTHMWORKS",
        sub_application_id: "RHYTHMWORKS",
      }));
    });

    return formArray;
  }


  editApiHub(payload) {
    this.showNewEntry();
    this.defineApiHubForm.patchValue({
      id: payload.id,
      name: payload.name,
      company_ref_id: payload.company_ref_id,
      channel_ref_id: payload.channel_ref_id,
      self_channel_ref_id: payload.self_channel_ref_id,
      request_type_ref_id: payload.request_type_ref_id,
      from_date: payload.from_date,
      to_date: payload.to_date,
      revision_status: payload.revision_status,
      updated_date_time: new Date(),
      initialItemRow: payload.initialItemRow
    });
    this.defineApiHubForm.setControl('initialItemRow', this.setExistingArray(payload.initialItemRow))
    this.btnValue = 'Update';
    const id = $('#id').val();
    if (id != '') {
      $('#new_entry_form').show();
      $('#new_entry_title').show();
      $('#btn_list').show();
      $('#list_form').hide();
      $('#list_title').hide();
      $('#btn_new_entry').hide();
    }

  }

  deleteData(value: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        value.is_deleted = 'Y';
        for (var i = 0; i < value.initialItemRow.length; i++) {
          value.initialItemRow[i].is_deleted = 'Y';
        }
        this.apiHubService.deleteDefineApi(value).subscribe((data: any) => {
          if (data.status == 1) {
            this.apiMasterData.splice(
              this.apiMasterData.findIndex(data => data.id === value.id), 1)
            Swal.fire({
              title: 'Your record has been deleted successfully!',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            setTimeout(function () { location.href = 'http://127.0.0.1:4200/#/api-hub/define-api'; }, 2000);
          }
        });
      }
    });
  }

}