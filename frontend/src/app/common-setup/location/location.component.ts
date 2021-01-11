import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import Swal from 'sweetalert2';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';


declare const $: any;
//declare const swal: any;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.sass']
})
export class LocationComponent implements OnInit {
  @ViewChild('roleTemplate', { static: true }) roleTemplate: TemplateRef<any>;

  locationForm: FormGroup;
  locationdata=[]; 
  countrydata:[];
  statedata:[];
  citydata:[];
  currencydata:[];
  submitted = false;
  BTN_VAL = 'Submit';
  application_id: "Unknown";
  userid: string;
  sub_application_id="Unknown";

  tbl_columns = [
    { name: 'Location' },
    { name: 'Address1' },
    { name: 'Address2' },
    { name: 'Address3' },
    { name: 'Country' },
    { name: 'State' },
    { name: 'City' }
  ];
  tbl_data = [];
 tbl_FilteredData = [];

  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;

  constructor(private formBuilder: FormBuilder, private commonSetupService: CommonSetupService, private dynamicScriptLoader: DynamicScriptLoaderService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    'use strict';
    this.startScript();

    $('#list_form').show();
    $('#list_title').show();
    $('#btn_new_entry').show();
    $('#btn_list').hide();
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();

    //this.userid = localStorage.getItem('id');

      this.locationForm = this.formBuilder.group({
      id:'',
      location_name: [null, Validators.required],
      address1: [null, Validators.required],
      address2: [null, Validators.required],
      address3: [null, Validators.required],
      country_id: [null, Validators.required],
      state_id: [this.statedata],
      city_id: [null, Validators.required],
      
    });

    this.commonSetupService.getCountryData().subscribe((data: []) => {
      this.countrydata = data;
    });

    this.commonSetupService.getLocationData().subscribe((data: []) => {
      this.locationdata = data;
    });

    this.locationForm.get('country_id').valueChanges.subscribe(val => {
      this.statedata = [];
      console.log(val);
      if (val != null) {
        this.commonSetupService.getStateData(val).subscribe((data: []) => {
        this.statedata = data;
        })
      }
    })

    this.locationForm.get('state_id').valueChanges.subscribe(val => {
      this.citydata = [];
      if (val != null) {
        this.commonSetupService.getCityData().subscribe((data: []) => {
          this.citydata = data;
        })
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
      this.locationForm.reset({sub_application_id:"Unknown",application_id:"Unknown",updated_date_time:new Date()});
      console.log("sub_application_id:",this.locationForm)
    }
  
    // convenience getter for easy access to form fields
    get f() { return this.locationForm.controls; }

    // Table 
    tbl_FilterDatatable(event) {
      // get the value of the key pressed and make it lowercase
      const val = event.target.value.toLowerCase();
      // get the amount of columns in the table
      const colsAmt = this.tbl_columns.length;
      // get the key names of each column in the dataset
      const keys = Object.keys(this.tbl_FilteredData[0]);
      // assign filtered matches to the active datatable
      this.locationdata = this.tbl_FilteredData.filter(function(item) {
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


    onSubmit() {
      this.submitted = true;
  
      if (this.locationForm.invalid) {
        return;
      } else {
        this.commonSetupService.saveLocationData(this.locationForm.value).subscribe((data: any) => {
        console.log("In save function ");
        console.log(data);
          if (data.status === 1) {
            Swal.fire({
              icon: 'success',
              title: 'Your record has been added successfully!',
              showConfirmButton: false,
              timer: 2000
            });
            //this.locationdata.push(data);
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
          setTimeout(function(){location.href='http://localhost:4200/#/common-setup/location'} , 2000);
        },
          (error: any) => {
            // console.log("ERROR",error.error.split(" ")[0])
            console.log("ERRRRROR", error)
            console.log("sub_application_id:",this.locationForm)
  
            //Error Meassage
            let message=""
            try
            {
              //Get the error message from exception thrown by the django
              message=error.error.substring(1,100) 
            }catch(err){
              console.log(err)
            }
            if(message.includes("location_name")){
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

    editLocation(location) {
      this.locationForm.patchValue({
        location_name: location.location_name,
        address1: location.address1,
        address2: location.address2,
        address3: location.address3,
        id: location.id,
        state_id: location.state_id,
        city_id: location.city_id,
        country_id: location.country_id,
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
  
    deleteLocationData(id){
      this.commonSetupService.deleteLocationData(id).subscribe((data:any)=>{
        if (data == 1) {
          Swal.fire({
            title: 'Your record has been deleted successfully!',
            icon: 'warning',
            showConfirmButton: false
          });
      }
    setTimeout(function(){location.href='http://localhost:4200/#/common-setup/location'} , 2000);
      });
      
    }
  }
  
