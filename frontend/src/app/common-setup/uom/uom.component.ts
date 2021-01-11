import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { CommonSetupService } from 'src/app/services/common-setup.service';
import Swal from 'sweetalert2';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { isInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
declare const $: any;
// declare const Swal: any;

// @ts-ignore
@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.sass']
})
export class UomComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;
  uomForm: FormGroup;
  submitted = false;
  BTN_VAL='Submit';
  APPLICATION_ID: string;
  USERID: string;
  uomdata = [];

  columns = [
    { name: 'UOM Code' },
    { name: 'UOM Description' },
  ];

  tbl_FilteredData = [];
  private uom_code: number;
  private uom_description: string;
  private id: number;

  constructor(private formBuilder: FormBuilder,private commonSetupService: CommonSetupService,private dynamicScriptLoader: DynamicScriptLoaderService) { }

  ngOnInit() {
    this.showList()
    this.APPLICATION_ID = localStorage.getItem('APPLICATION_ID');
    this.USERID = localStorage.getItem('ID');

    this.uomForm = this.formBuilder.group({
      uom_code: ['', Validators.required],
      uom_description: ['', Validators.required],
      sub_application_id: 'sub_application_id',
      is_deleted: 'N',
      ID: [''],
      application_id: '5',
      USERID: [this.USERID]
  });

  $( document ).ready(function() {
    $('#new_entry_form').hide();
    $('#new_entry_title').hide();
    $('#btn_list').hide();
  });

  


  this.commonSetupService.getUomData().subscribe((data:[])=>{
    this.uomdata = data;
    this.tbl_FilteredData = data.filter(function (data: any) {
      return data.is_deleted == 'N';
    });

    console.log(data);
    console.log(this.tbl_FilteredData);
    
  });

  'use strict';
  this.startScript();


  }

 

  editUomData(uom){
    this.uomForm.patchValue({
      uom_code: uom.uom_code,
      uom_description: uom.uom_description,
      ID: uom.id
    });
    this.BTN_VAL='Update';

    var id=$("#ID").val();
		if(id!='')
		{
			$("#new_entry_form").show();
			$("#new_entry_title").show();
			$("#btn_list").hide();
			$("#btn_new_entry").hide();
			$("#list_form").hide();
			$("#list_title").hide();
		}
  }

  deleteUomData(ID){
//   	Swal.fire('Hello world!')
	Swal.fire({
  		title: 'Are you sure?',
  		text: 'You will not be able to recover this imaginary file!',
  		icon: 'warning',
  		showCancelButton: true,
  		confirmButtonText: 'Yes, delete it!',
  		cancelButtonText: 'No, keep it'
	}).then((result) => {
  			if (result.value){
  				this.commonSetupService.deleteUomData(ID).subscribe((data:any)=>{
                    Swal.fire({icon: 'success', title: 'Deleted!', text: 'Your file has been deleted!', showConfirmButton: false, timer: 3000})

        		})
  				setTimeout(function(){location.href='http://127.0.0.1:4200/#/common-setup/uom'} , 2000);
  			}
			else if (result.dismiss === Swal.DismissReason.cancel){
    			Swal.fire({icon: 'error', title: 'Canceled!', text: 'Your file is safe :)', showConfirmButton: false, timer: 3000})
  			}
		})
// 	setTimeout(function(){location.href='http://127.0.0.1:4200/#/common-setup/uom'} , 2000);
  }

  async startScript() {
    await this.dynamicScriptLoader.load('dataTables.buttons', 'buttons.flash', 'jszip', 'buttons.html5', 'buttons.print').then(data => {
      this.loadData();
    }).catch(error => console.log(error));
  }

  private loadData() {
    alert("In loadData")
    $('#table').DataTable({
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
      ]
    });
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
  get f() { return this.uomForm.controls; }

  tbl_FilterDatatable(event) {
    // get the value of the key pressed and make it lowercase
    const val = event.target.value;
    console.log("val====",val);
    // get the amount of columns in the table
    let colsAmt = this.columns.length;

    console.log("colsAmt===",colsAmt);
    
    // get the key names of each column in the dataset
    const keys = Object.keys(this.tbl_FilteredData[0]);
    console.log("keys===",keys);
    console.log(this.uomdata);
    
    // assign filtered matches to the active datatable
    this.uomdata = this.tbl_FilteredData.filter(function(item) {
      // iterate through each row's column data
      console.log("item===",item);
      
      for (let i = 0; i < colsAmt; i++) {
        console.log("In For Loop");
        
        // check for a match
        console.log("item[keys[i]]====",item[keys[i]]);
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

//     stop here if form is invalid
    if (this.uomForm.invalid) {
        return;
    }
    else{

//       this.id = this.uomForm.get("ID").value

      this.commonSetupService.saveUomData(this.uomForm.value).subscribe((data:any)=>{
        if (data == 1) {
            Swal.fire('Your record has been added successfully!')
        }
        if (data == 2) {
          Swal.fire('Your record has been updated successfully!')
        }
	      setTimeout(function(){location.href='http://127.0.0.1:4200/#/common-setup/uom'} , 3000);

          Swal.fire({icon: 'success', title: 'Your record has been added successfully!', showConfirmButton: false, timer: 3000})

      },
            error => {
            //Failure
            console.log(error);
            Swal.fire('Record Already Exists!')

      });

    }
  }

}
