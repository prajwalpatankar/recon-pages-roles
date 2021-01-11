import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';

@Injectable({
  providedIn: 'root'
})
export class CompanySetupService {
  private apiroot = "http://localhost:8000/"

  constructor(  private http : HttpClient
    ) { }

  getCompanyData() {
    return this.http.get(this.apiroot.concat('company/'));
  }

  saveCompanyData(formValue) {
    if(formValue.ID){
      formValue.updated_by = formValue.USERID
      return this.http.put(this.apiroot.concat(`company/${formValue.ID}/`), formValue).pipe(map(data => {
        data['status'] = 2;
        return data;
      })
      );
    }
    formValue.created_by = formValue.USERID;
    formValue.entity_share_id = formValue.company_shortname+"-" ;
    return this.http.post(
      this.apiroot.concat('company/'),
      formValue
    ).pipe(map(data => {
      data['status'] = 1;
      return data;
    }))
  }

  deleteCompanyData(company){
    company.is_deleted = 'Y';
    return this.http.put(this.apiroot.concat(`company/${company.ID}/`),
      company
    ).pipe(map(data => {
      data['status'] = 1;
      return data;
    }));
  }

  getLocation(location_id){
    return this.http.get(this.apiroot.concat(`location/${location_id}/`))
  }

  getCountryData(country_id){
    return this.http.get(this.apiroot.concat(`country/${country_id}/`));
  }

  getStateData(state_id){
    return this.http.get(this.apiroot.concat(`state/${state_id}/`));
  }

  getCityData(city_id){
    return this.http.get(this.apiroot.concat(`city/${city_id}/`));
  }

  getLocationData(){
    return this.http.get(this.apiroot.concat('location/'));
  }

  getCurrencyData(country_id){
    return this.http.get(this.apiroot.concat(`currency/ofcountry/${country_id}/`));
  }

  getUserData(){
    return this.http.get(this.apiroot.concat('user/'));
  }

  getOwnerStatusData(){
    return this.http.get(this.apiroot.concat('master/oftype/Ownership'))
  }
}
