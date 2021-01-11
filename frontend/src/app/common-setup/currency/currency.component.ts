/* tslint:disable */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import Swal from 'sweetalert2';

declare const $: any;

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.sass']
})
export class CurrencyComponent implements OnInit {
  currencydata = [];
  countrydata = [];
  currencyForm: FormGroup;
  submitted = false;
  BTN_VAL = 'Submit';
  application_id: "Unknown";
  userid: string;
  sub_application_id="Unknown"
  // tslint:disable-next-line:max-line-length
  constructor(private formBuilder: FormBuilder, private commonSetupService: CommonSetupService, private dynamicScriptLoader: DynamicScriptLoaderService) { }

  ngOnInit() {
    'use strict';
    this.startScript();

    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();

    // this.application_id = localStorage.getItem('application_id');
    this.userid = localStorage.getItem('id');

    this.currencyForm = this.formBuilder.group({
      currency_code: ['', Validators.required],
      currency_name: ['', Validators.required],
      symbol: ['', Validators.required],
      country_id: [null, Validators.required],
      id: [''],
      application_id: "Unknown",      //[this.application_id],
      sub_application_id: "Unknown", 
      updated_date_time: [Date]

      // userid: [this.userid]

    });

    //Display Currency data
    this.commonSetupService.getCurrencyData().subscribe((data: []) => {
      this.currencydata = data.filter(function (data: any) {
        //Only get records which are not deleted
        return data.is_deleted == 'N';
      });
    });

    this.commonSetupService.getCountryData().subscribe((data: []) => {
      this.countrydata = data;
    });
  }

  //Delete currency
  deleteCurrencyData(value: any) {
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
        this.commonSetupService.deleteCurrency(value).subscribe((data: any) => {
          if (data.status == 1) {
            this.currencydata.splice(
              this.currencydata.findIndex(data => data.id === value.id), 1
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


  editCurrency(currency) {
    this.currencyForm.patchValue({
      currency_code: currency.currency_code,
      currency_name: currency.currency_name,
      symbol: currency.symbol,
      id: currency.id,
      country_id: currency.country_id,
      application_id: "Unknown",
      sub_application_id: "Unknown",
      updated_date_time: new Date()
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

  async startScript() {
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
    this.BTN_VAL = 'Sumbit';
  }

  showList() {
    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
    this.submitted = false;
    this.currencyForm.reset({sub_application_id:"Unknown",application_id:"Unknown",updated_date_time:new Date()});
    console.log("sub_application_id:",this.currencyForm)
  }

  // convenience getter for easy access to form fields
  get f() { return this.currencyForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.currencyForm.invalid) {
      return;
    } else {
      this.commonSetupService.saveCurrencyData(this.currencyForm.value).subscribe((data: any) => {
        //Insert Data
        if (data.status === 1) {
          Swal.fire({
            title: 'Your record has been added successfully!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.currencydata.push(data);
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
          let index = this.currencydata.findIndex(item => item.id === data.id)
          this.currencydata[index] = data
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
        // setTimeout(function () { location.href = 'http://127.0.0.1:4200/#/common-setup/currency'; }, 2000);
      },
        (error: any) => {
          // console.log("ERROR",error.error.split(" ")[0])
          console.log("ERRRRROR", error)
          console.log("sub_application_id:",this.currencyForm)

          //Error Meassage
          let message=""
          let message1=""
          try
          {
            //Get the error message from exception thrown by the django
            message=error.error.substring(1,1000) 
            console.log("mESSAGE=====",message);
            
          }catch(err){
            console.log(err)
          }
          if(message.includes("<title>IntegrityError")){
            // if (error.error.currency_code) {
              Swal.fire({
                title: 'Currency Code Already Exist!',
                icon: 'warning',
                showConfirmButton: false
              });
            }
          if(message.includes("currency_code")){
          // if (error.error.currency_code) {
            Swal.fire({
              title: 'Currency Code Already Exist!',
              icon: 'warning',
              showConfirmButton: false
            });
          }
          else if(message.includes("country_id")){
            Swal.fire({
              title: 'Country Name Already Exist!',
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
