import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { ApiHubService } from 'src/app/services/api-hub.service';
import Swal from 'sweetalert2';

declare const $: any;

@Component({
  selector: 'app-define-standard-api-definition',
  templateUrl: './define-standard-api-definition.component.html',
  styleUrls: ['./define-standard-api-definition.component.sass']
})

export class DefineStandardApiDefinitionComponent implements OnInit {

    defineStandardApiForm: FormGroup;
    companyData = [];
    channelData = [];
    fromDateControl: FormControl;
    submitted = false;
    typeOfRequest = [];
    typeOfAPI = [];
    protocol = [];
    authentication = [];
    typeOfCommunication = [];
    sessionKeyEncryption = [];
    encryptionType = [];
    verificationAlgo = [];
    btnValue = "Submit";
    todayDate = new Date().toJSON().split('T')[0];
  
    standardApiMasterData = [];
  
    typeOfFormat = [];
  
    constructor(private apiHubService: ApiHubService, private formBuilder: FormBuilder) { }
  
    ngOnInit(): void {
      this.showList();
      this.defineStandardApiForm = this.formBuilder.group({
        id: ['', Validators.required],
        company_ref_id: ['', Validators.required],
        channel_ref_id: ['', Validators.required],
        from_date: [this.fromDateControl, Validators.required],
        to_date: ['2099-12-31'],
        revision_status: ['', Validators.required],
        sub_application_id: "RHYTHMFLOWS",
        application_id: "RHYTHMFLOWS",
        initialItemRow: this.formBuilder.array([this.initialitemRow()])
      });
  
      this.defineStandardApiForm.get("from_date").valueChanges.subscribe(val => {
        if (val != null) {
          if (val === this.todayDate) {
            this.defineStandardApiForm.get("revision_status").setValue("Effective");
          } else {
            this.defineStandardApiForm.get("revision_status").setValue("Future");
          }
        }
      });
  
      this.apiHubService.getStandardApiMaster().subscribe(data => {
        this.standardApiMasterData = data;
      })
  
      this.apiHubService.getCompanyData().subscribe(data => {
        this.companyData = data;
      });
  
      this.apiHubService.getChannelData('').subscribe(data => {
        this.channelData = data;
      });
  
      this.apiHubService.getMasterData().subscribe(data => {
  
        this.typeOfRequest = data.filter(function (data: any) {
          return data.master_type == 'Type of Request for API';
        });
  
        this.typeOfAPI = data.filter(function (data: any) {
          return data.master_type == 'Type of API';
        });
  
        this.protocol = data.filter(function (data: any) {
          return data.master_type == 'Type of Protocol';
        });
  
        this.typeOfFormat = data.filter(function (data: any) {
          return data.master_type == 'Type of File';
        });
  
        this.authentication = data.filter(function (data: any) {
          return data.master_type == 'Type of Authentication';
        });
  
        this.typeOfCommunication = data.filter(function (data: any) {
          return data.master_type == 'Type of Communication';
        });
  
        this.sessionKeyEncryption = data.filter(function (data: any) {
          return data.master_type == 'Type of Session_Key Encryption';
        });
  
        this.encryptionType = data.filter(function (data: any) {
          return data.master_type == 'Type of Session_Key Encryption';
        });
  
        this.verificationAlgo = data.filter(function (data: any) {
          return data.master_type == 'Type of Session_Key Encryption';
        });
      });
  
      // width of select box
      // $('select').css("width", '150px');
  
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
  
    get f() {
      return this.defineStandardApiForm.controls;
    }
  
    initialitemRow() {
      return this.formBuilder.group({
        id: [''],
        request_type_ref_id: ['', Validators.required],
        api_type_ref_id: ['', Validators.required],
        protocol_type_ref_id: ['', Validators.required],
        file_format_type_ref_id: ['', Validators.required],
        authentication_type_ref_id: ['', Validators.required],
        communication_ref_id: ['', Validators.required],
        session_key_encryption_type_ref_id: ['', Validators.required],
        encryption_type_ref_id: ['', Validators.required],
        port: ['', Validators.required],
        verification_algorithm_ref_id: ['', Validators.required],
        end_point_url: ['', Validators.required],
        time_out: ['', Validators.required],
        sub_application_id: "RHYTHMFLOWS",
        application_id: "RHYTHMFLOWS"
      });
    }
  
    get formArray() {
      return this.defineStandardApiForm.get('initialItemRow') as FormArray;
    }
  
    addNewRow() {
      this.formArray.push(this.initialitemRow());
    }
  
    deleteRow(index) {
      if (this.formArray.length == 1) {
        return false;
      } else {
        this.formArray.removeAt(index);
        return true;
      }
    }
  
    onSubmit() {
      this.submitted = true;
      this.apiHubService.saveStandardApiData(this.defineStandardApiForm.value).subscribe((data: any) => {
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
        setTimeout(function () {
          location.href = 'http://127.0.0.1:4200/#/api-hub/define-standard-api-definition';
        }, 2000);
      });
    }
  
    setExistingArray(initialArray = []): FormArray {
      const formArray = new FormArray([]);
      initialArray.forEach(element => {
        formArray.push(this.formBuilder.group({
          id: element.id,
          request_type_ref_id: element.request_type_ref_id,
          api_type_ref_id: element.api_type_ref_id,
          protocol_type_ref_id: element.protocol_type_ref_id,
          file_format_type_ref_id: element.file_format_type_ref_id,
          authentication_type_ref_id: element.authentication_type_ref_id,
          communication_ref_id: element.communication_ref_id,
          session_key_encryption_type_ref_id: element.session_key_encryption_type_ref_id,
          encryption_type_ref_id: element.encryption_type_ref_id,
          port: element.port,
          verification_algorithm_ref_id: element.verification_algorithm_ref_id,
          end_point_url: element.end_point_url,
          time_out: element.time_out,
          sub_application_id: "RHYTHMFLOWS",
          application_id: "RHYTHMFLOWS"
        }));
      });
      return formArray;
    }
  
    editStandardApi(payload) {
      this.showNewEntry();
      this.defineStandardApiForm.patchValue({
        id: payload.id,
        company_ref_id: payload.company_ref_id,
        channel_ref_id: payload.channel_ref_id,
        from_date: payload.from_date,
        to_date: payload.to_date,
        updated_date_time: new Date(),
        // initialItemRow: payload.initialItemRow
      });
      this.defineStandardApiForm.setControl('initialItemRow', this.setExistingArray(payload.initialItemRow));
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
          this.apiHubService.deleteStandardAPI(value).subscribe((data: any) => {
            if (data.status == 1) {
              this.standardApiMasterData.splice(
                this.standardApiMasterData.findIndex(data => data.id === value.id), 1
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
  
    resizeElement(e) {
      $(e).css('width', `${($(e).val().length) * 8}px`);
    }
    //$(e).css('width',(($(e).val().length) * 8) + 'px');
  }