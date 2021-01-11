import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ApiHubService } from 'src/app/services/api-hub.service';
import { ReconcilationService } from 'src/app/services/reconcilation.service';

declare const $: any;

@Component({
  selector: 'app-dispute-resolution',
  templateUrl: './dispute-resolution.component.html',
  styleUrls: ['./dispute-resolution.component.sass']
})
export class DisputeResolutionComponent implements OnInit {

  disputeResolutionForm: FormGroup;
  btnValue = 'Submit';
  disputeResolutionForm1: FormGroup;
  submitted = false;
  companyData = [];
  channelData = [];
  reconDefMstData = [];
  channel_idControl: FormControl;
  sourceDetails = [];
  roleMasterdata = [];

  constructor(private formbuilder: FormBuilder, private reconService: ReconcilationService, private apiHubService: ApiHubService) { }

  ngOnInit(): void {
    this.channel_idControl = new FormControl(null, Validators.required)
    this.channel_idControl.disable();
    this.disputeResolutionForm = this.formbuilder.group({
      company_ref_id: ['', Validators.required],
      channel_ref_id: this.channel_idControl
    });
    this.reconService.getCompanyData().subscribe(data => {
      this.companyData = data;
    });

    this.disputeResolutionForm1 = this.formbuilder.group({

    });



    // this.reconService.getChannelData('').subscribe(data => {
    //   this.channelData = data;
    // });

    this.disputeResolutionForm.get("company_ref_id").valueChanges.subscribe(val => {
      this.channelData = [];
      if (val != "null") {
        this.reconService.getChannelData(val).subscribe((data: []) => {
          this.channelData = data['companies'];
        });
        this.channel_idControl.enable();
      }
      else {
        this.channel_idControl.disable();
      }
    })

    this.reconService.getReconcilationMaster().subscribe(data => {
      this.reconDefMstData = data;
    });

    this.reconService.getSourceDetails('').subscribe(data => {
      this.sourceDetails = data;
    });

    this.reconService.getRoleMasterData().subscribe(data => {
      // document.getElementById('roleData') = data;
      this.roleMasterdata = data;
    });

  }

  sourceTables = [];
  disputeSourceTables = {};
  subSourceDetails = {};

  filterSourcesNames(id) {
    $("#tableExport").empty();
    $('#field-details').remove();
    this.sourceTables = [];
    this.disputeSourceTables = {};
    this.subSourceDetails = {};

    for (let index = 0; index < this.reconDefMstData.length; index++) {
      // to check and to filter only selected element
      if (this.reconDefMstData[index]['id'] == id) {
        // get names of sources from recon master table
        var source_name1_ref_name = this.reconDefMstData[index]['source_name_1']
        var source_name2_ref_name = this.reconDefMstData[index]['source_name_2']
        var source_name3_ref_name = this.reconDefMstData[index]['source_name_3']
        var source_name4_ref_name = this.reconDefMstData[index]['source_name_4']

        $("#source_name1_ref_name").val(source_name1_ref_name);
        $("#source_name2_ref_name").val(source_name2_ref_name);
        $("#source_name3_ref_name").val(source_name3_ref_name);
        $("#source_name4_ref_name").val(source_name4_ref_name);

        var source_name1_ref_id = this.reconDefMstData[index]['source_name1_ref_id'];
        var source_name2_ref_id = this.reconDefMstData[index]['source_name2_ref_id'];
        var source_name3_ref_id = this.reconDefMstData[index]['source_name3_ref_id'];
        var source_name4_ref_id = this.reconDefMstData[index]['source_name4_ref_id'];

        // get ids of sources from recon master table
        $("#source_name1_ref_id").val(source_name1_ref_id);
        $("#source_name2_ref_id").val(source_name2_ref_id);
        $("#source_name3_ref_id").val(source_name3_ref_id);
        $("#source_name4_ref_id").val(source_name4_ref_id);

        // get company ids from recon master table


        // get field names based on is_key_field and header_ref_id
        this.subSourceDetails[source_name1_ref_name] = this.sourceDetails.filter(function (data: any) {
          return data.is_key_field == true && data.header_ref_id == source_name1_ref_id;
        });
        this.subSourceDetails[source_name2_ref_name] = this.sourceDetails.filter(function (data: any) {
          return data.is_key_field == true && data.header_ref_id == source_name2_ref_id;
        });
        this.subSourceDetails[source_name3_ref_name] = this.sourceDetails.filter(function (data: any) {
          return data.is_key_field == true && data.header_ref_id == source_name3_ref_id;
        });
        this.subSourceDetails[source_name4_ref_name] = this.sourceDetails.filter(function (data: any) {
          return data.is_key_field == true && data.header_ref_id == source_name4_ref_id;
        });

        var roleHeader = '<th rowspan="2" style="text-align:center">' + 'Role' + '</th>';
        var tableHeader = '<thead><tr>' + roleHeader;
        var subHeader = '';
        var subString = '<th style="text-align:center">Total no of Records</th><th style="text-align:center">Total no of non-reconciled Records</th>';
        var table = $("#tableExport");
        var fieldNamesArray = {};
        var tempfieldNamesArray = {};

        if (this.reconDefMstData[index]['source_name1_ref_id'] != null) {

          // hidden field=>
          // var companyHiddenField = '<input type="hidden" >'
          // to get field_names for dispute_tables from soucedatails
          tempfieldNamesArray = {};
          for (const key in this.subSourceDetails[source_name1_ref_name]) {
            const element = this.subSourceDetails[source_name1_ref_name][key];
            tempfieldNamesArray[key] = element.field_name;
          }
          this.sourceTables.push("tbl_" + (this.reconDefMstData[index]['source_name_1']) + "_details");
          this.disputeSourceTables["tbl_" + (this.reconDefMstData[index]['source_name_1']) + "_dispute_details"] = tempfieldNamesArray;
          tableHeader += '<th colspan="2" style="text-align:center">' + this.reconDefMstData[index]['source_name_1'] + '</th>';
          subHeader += subString;
          fieldNamesArray[source_name1_ref_name] = Object.values(tempfieldNamesArray);
        }

        if (this.reconDefMstData[index]['source_name2_ref_id'] != null) {
          tempfieldNamesArray = {};
          for (const key in this.subSourceDetails[source_name2_ref_name]) {
            const element = this.subSourceDetails[source_name2_ref_name][key];
            tempfieldNamesArray[key] = element.field_name;
          }
          this.sourceTables.push("tbl_" + (this.reconDefMstData[index]['source_name_2']) + "_details");
          this.disputeSourceTables["tbl_" + (this.reconDefMstData[index]['source_name_2']) + "_dispute_details"] = tempfieldNamesArray;
          tableHeader += '<th colspan="2" style="text-align:center">' + this.reconDefMstData[index]['source_name_2'] + '</th>';
          subHeader += subString;
          fieldNamesArray[source_name2_ref_name] = Object.values(tempfieldNamesArray);
        }

        if (this.reconDefMstData[index]['source_name3_ref_id'] != null) {
          tempfieldNamesArray = {};
          for (const key in this.subSourceDetails[source_name3_ref_name]) {
            const element = this.subSourceDetails[source_name3_ref_name][key];
            tempfieldNamesArray[key] = element.field_name;
          }
          this.sourceTables.push("tbl_" + (this.reconDefMstData[index]['source_name_3']) + "_details");
          this.disputeSourceTables["tbl_" + (this.reconDefMstData[index]['source_name_3']) + "_dispute_details"] = tempfieldNamesArray;
          tableHeader += '<th colspan="2" style="text-align:center">' + this.reconDefMstData[index]['source_name_3'] + '</th>';
          subHeader += subString;
          fieldNamesArray[source_name3_ref_name] = Object.values(tempfieldNamesArray);
        }

        if (this.reconDefMstData[index]['source_name4_ref_id'] != null) {
          tempfieldNamesArray = {};
          for (const key in this.subSourceDetails[source_name4_ref_name]) {
            const element = this.subSourceDetails[source_name4_ref_name][key];
            tempfieldNamesArray[key] = element.field_name;
          }
          this.sourceTables.push("tbl_" + (this.reconDefMstData[index]['source_name_4']) + "_details");
          this.disputeSourceTables["tbl_" + (this.reconDefMstData[index]['source_name_4']) + "_dispute_details"] = tempfieldNamesArray;
          tableHeader += '<th colspan="2" style="text-align:center">' + this.reconDefMstData[index]['source_name_4'] + '</th>';
          subHeader += subString;
          fieldNamesArray[source_name4_ref_name] = Object.values(tempfieldNamesArray);
        }

        if ($("#tableExport thead").length == 0) {
          tableHeader += '</tr><tr>' + subHeader + '</tr></thead>';
          table.append(tableHeader);
        }

        this.reconService.getTablesDetails({ "sourceTables": this.sourceTables, "disputeSourceTables": this.disputeSourceTables }).subscribe(data => {
          var tableBody = '<tbody><tr class="show_hide_details">';
          var reconciledButton = '<td id="roleData">' + this.roleMasterdata[0].role_name + '</td>';
          var columnString = '';
          var detailsRow = '';
          var numRowsArray = [];
          var detailsRowRecords = {};

          for (let index = 0; index < data['sourceResult'].length; index++) {
            const sourceElement = data['sourceResult'][index];
            const disputeSourceElement = data['disputeSourceResult'][index];

            for (const key in data['sourceResult'][index]) {
              if (Object.prototype.hasOwnProperty.call(sourceElement, key) && Object.prototype.hasOwnProperty.call(disputeSourceElement, key)) {
                columnString += '<td style="text-align:center">' + sourceElement[key][0] + '</td><td style="text-align:center">' + disputeSourceElement[key].length + '</td>';
                numRowsArray.push(disputeSourceElement[key].length);
                detailsRowRecords[key] = disputeSourceElement[key];
              }
            }
          }

          var fieldDetailsTable = '<form [formGroup]="disputeResolutionForm1"><div id="field-details" class="collapsable" style="display: none;"><table class="display table table-hover table-checkable order-column m-t-20 width-per-100 table-bordered"><thead><tr>'
          var actionHeader = '<th rowspan="2" style="text-align:center">' + 'Action' + '</th>';
          var fieldNamesHeader = actionHeader;
          var fieldNamesSubHeader = '';
          for (const key in fieldNamesArray) {
            fieldNamesHeader += '<th style="text-align:center" colspan="' + fieldNamesArray[key].length + '">' + key + '</th>';
            if (Object.prototype.hasOwnProperty.call(fieldNamesArray, key)) {
              for (let index = 0; index < fieldNamesArray[key].length; index++) {
                fieldNamesSubHeader += '<th style="text-align:center">' + fieldNamesArray[key][index] + '</th>';
              }
            }
          }

          fieldNamesSubHeader = '<tr>' + fieldNamesSubHeader + '</tr>';
          fieldNamesHeader = fieldNamesHeader + '</tr>' + fieldNamesSubHeader;
          // ' + key + '_' + element[index][0] + '
          for (const key in detailsRowRecords) {
            if (Object.prototype.hasOwnProperty.call(detailsRowRecords, key)) {
              const element = detailsRowRecords[key];
              for (let index = 0; index < element.length; index++) {
                detailsRow += '<tr><td class="form-check-td"><input style="margin-left: auto;" class="form-check-input" type="checkbox" id="' + key + '_' + element[index][0] + '" value=""></td>';
                for (const newKey in fieldNamesArray) {
                  for (let j = 1; j <= fieldNamesArray[newKey].length; j++) {
                    var hiddenInputField = ''; //'<input type="hidden" id="details_ref_id' + element[index][0] + '" formControlName="details_ref_id">';
                    if (key == newKey) {
                      // <input type="hidden" id="source_name_4_ref_id{{i+1}}" formControlName="source_name_4_ref_id">
                      detailsRow += '<td class="editable" style="text-align:center">' + element[index][j] + hiddenInputField + '</td>';
                    } else {
                      detailsRow += '<td class="editable">' + hiddenInputField + '</td>';
                    }
                  }
                }
                detailsRow += '</tr>';
              }
            }
          }

          fieldDetailsTable = fieldDetailsTable + fieldNamesHeader + detailsRow + '</thead></table></div></form>'

          tableBody += reconciledButton + columnString + '</tr></tbody>';
          $("#tableExport tbody").remove();
          table.append(tableBody);

          $(document).ready(function () {
            $('.show_hide_details').on('click', function () {
              if ($("#field-details").length == 0) {
                $('#detailed-data').append(fieldDetailsTable);
              }
              $(".collapsable").slideToggle();
            });

            $(document).on('click', '.form-check-input', function () {
              if (this.checked == true) {
                $(this).parents('tr').find('.editable').attr('contenteditable', true);
              } else {
                $(this).parents('tr').find('.editable').removeAttr('contenteditable');
              }
            });

            // $(document).on('click', '.editable', function() {
            //   console.log($(this).siblings('.form-check-td'), '12345555555555555555555');
            // });
          });
        });

      } // end of if
    } // end of for 
  } // end of function


  updateNonReconciledData() { }


}
