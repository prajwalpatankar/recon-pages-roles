import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CommonSetupService {

  private baseUrl = "http://127.0.0.1:8000/";

  constructor(private http: HttpClient) { }

  getCountryData() {
    return this.http.get(this.baseUrl.concat('country/'));
  }

  getStateData(country_id) {
    return this.http.get(this.baseUrl.concat('state/'));
  }

  getCityData() {
    return this.http.get(this.baseUrl.concat('city/'));
  }

  getLocationData() {
    return this.http.get(this.baseUrl.concat('location/'));
  }

  getUomData() {
    return this.http.get(this.baseUrl.concat('uom/'));
  }

  getTermData() {
    return this.http.get(this.baseUrl.concat('term/'));
  }

  getCurrencyData() {
    return this.http.get(this.baseUrl.concat('currency/'));
  }

  getRejectionReasonData(){
    return this.http.get(this.baseUrl.concat('reason/'));
  }


  saveUomData(value) {
  if(value.ID){
        return this.http.put(this.baseUrl.concat('uom/'+value.ID+'/'), value);
    }
    return this.http.post(this.baseUrl.concat('uom/'), value);
  }

  saveLocationData(form) {
    form.application_id = 'RHYTHMFLOWS';
    form.sub_application_id = 'RHYTHMFLOWS';
    
    if(form.id)
    {
      return this.http.put(this.baseUrl.concat('location/'+form.id+'/'), form).pipe(map(data => {
        data['status'] = 1;
        return data;
      })
      );
    }
    else
    {
      return this.http.post(this.baseUrl.concat('location/'), form).pipe(map(data => {
        data['status'] = 2;
        return data;
      })
      );
    }
  }

  deleteLocationData(id) {
    console.log("In Service deleteLocationData");
    console.log(id);
    return this.http.delete(this.baseUrl.concat('location/'+id+'/'), id);
  }

  deleteCurrency(value: any) {
    return this.http.put(this.baseUrl.concat(`currency/${value.id}/`), value)
      .pipe(map(data => {
        data['status'] = 1;
        return data;
      }));
  }

  deleteReason(value: any) {
    return this.http.put(this.baseUrl.concat(`reason/${value.id}/`), value)
      .pipe(map(data => {
        data['status'] = 1;
        return data;
      }));
  }

  deleteTermData(value: any) {
    return this.http.put(this.baseUrl.concat('term/' + value.ID + '/'),
      value
    ).pipe(map(data => {
      data['status'] = 1;
      return data;
    }));
  }

  deleteUomData(ID) {
    return this.http.delete(this.baseUrl.concat(`uom/${ID}/`));
  }

  saveCurrencyData(value) {
    if (value.id) {
      //Update Data
      return this.http.put(this.baseUrl.concat('currency/' + value.id + '/'), value)
        .pipe(map(data => {
          data['status'] = 2;
          return data;
        }),
          catchError(this.errorHandler)
          
        );
    }
    else {
      console.log("FORMVALUE:",value)
      return this.http.post(this.baseUrl.concat('currency/'), value)
        .pipe(map(data => {
          data['status'] = 1;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
  }

  saveReasonData(value) {
    if (value.id) {
      //Update Data
      return this.http.put(this.baseUrl.concat('reason/' + value.id + '/'), value)
        .pipe(map(data => {
          data['status'] = 2;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
    else {
      console.log("FORMVALUE:",value)
      return this.http.post(this.baseUrl.concat('reason/'), value)
        .pipe(map(data => {
          data['status'] = 1;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
  }


  saveTermData(value: any) {
    if (value.ID) {
      value.updated_by = value.USERID;
      return this.http.put(
        this.baseUrl.concat('term/' + value.ID + '/'),
        value
      ).pipe(map(data => {
        data['status'] = 2;
        return data;
      }))
    }
    value.created_by = value.USERID;
    return this.http.post(
      this.baseUrl.concat('term/'),
      value
    ).pipe(map(data => {
      data['status'] = 1;
      return data;
    }))
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(error || "Server Error")
  }


}
