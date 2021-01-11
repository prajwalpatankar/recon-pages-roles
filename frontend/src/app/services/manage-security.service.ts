import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { GlobalConstants } from '../global/global-constants';

@Injectable({
  providedIn: 'root'
})
export class ManageSecurityService {

  private baseUrl = GlobalConstants.baseUrl;

  constructor(private http: HttpClient) { }

  getLeftPanelData() {
    return this.http.get(this.baseUrl.concat('/left-panel/'));
  }

  saveLeftPanelData(form) {
    if(form.id)
    {
      return this.http.put(this.baseUrl.concat('/left-panel/'+form.id+'/'), form).pipe(map(data => {
        data['status'] = 1;
        return data;
      })
      );
    }
    else
    {
      return this.http.post(this.baseUrl.concat('/left-panel/'), form).pipe(map(data => {
        data['status'] = 2;
        return data;
      })
      );
    }
  }

  deleteLeftPanelData(id) {
    console.log("In Service deleteLocationData");
    console.log(id);
    return this.http.delete(this.baseUrl.concat('/left-panel/'+id+'/'), id);
      // .pipe(map(data => {
      //   data['status'] = 1;
      //   return data;
      // }));
  }

  getCompanyRefData() {
    return this.http.get(this.baseUrl.concat('/company/'));
  }

  getRoleRefData() {
    return this.http.get(this.baseUrl.concat('/roleMst/'));
  }

  getFormRefData() {
    return this.http.get(this.baseUrl.concat('/left-panel/'));
  }

  getSpecificFormRefData(id) {
    return this.http.get(this.baseUrl.concat('/left-panel/' + id + '/'));
  }

  getRolesData() {
    return this.http.get(this.baseUrl.concat('/assign-roles/'));
  }

  saveRolesData(value) {
    if (value.id) {
      //Update Data
      return this.http.put(this.baseUrl.concat('/assign-roles/' + value.id + '/'), value)
        .pipe(map(data => {
          data['status'] = 2;
          return data;
        }),
          catchError(this.errorHandler)
          
        );
    }
    else {
      console.log("FORMVALUE:",value)
      return this.http.post(this.baseUrl.concat('/assign-roles/'), value)
        .pipe(map(data => {
          data['status'] = 1;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
  }


  // saveRolesData(form) {
  //   if(form.id)
  //   {
  //     for (var i = 0; i < form.initialItemRow.length; i++) {
  //       if (form.initialItemRow[i].id == '') {
  //         delete form.initialItemRow[i].id;
  //       }
  //     }
  //     return this.http.put(this.baseUrl.concat('/assign-roles/'+form.id+'/'), form).pipe(map(data => {
  //       data['status'] = 1;
  //       return data;
  //     })
  //     );
  //   }
  //   else
  //   {
  //     delete form['id']
  //     let initialItemRow = form.initialItemRow.filter(function (props) {
  //       delete props.id;
  //       return true;
  //     });
  //     return this.http.post(this.baseUrl.concat('/assign-roles/'), form).pipe(map(data => {
  //       data['status'] = 2;
  //       return data;
  //     })
  //     );
  //   }
  // }


  deleteRoles(value: any) {
    return this.http.delete(this.baseUrl.concat(`/assign-roles/${value.id}/`), value)
      // .pipe(map(data => {
      //   data['status'] = 1;
      //   return data;
      // }));
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(error || "Server Error")
  }

}
