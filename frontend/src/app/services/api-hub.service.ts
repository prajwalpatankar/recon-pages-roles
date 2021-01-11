import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiHubService {
  baseUrl = "http://127.0.0.1:8000";

  constructor(private http: HttpClient) { }

  errorHandler(error: HttpErrorResponse) {
    return throwError(error || "Server Error");
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  getCompanyData() {
    return this.http.get<any[]>(`${this.baseUrl}/company`);
  }

  getChannelData(id) {
    return this.http.get<any[]>(`${this.baseUrl}/channel/` + id);
  }

  getChannelAccCompanyData(id) {
    return this.http.get<any[]>(`${this.baseUrl}/company/` + id);
  }

  getMasterData() {
    return this.http.get<any[]>(`${this.baseUrl}/master`);
  }

  getApiMasterData() {
    return this.http.get<any[]>(`${this.baseUrl}/apimaster/`);
  }

  saveApiHubData(data) {
    if (data.id) {
      for (var i = 0; i < data.initialItemRow.length; i++) {
        if (data.initialItemRow[i].id == '') {
          delete data.initialItemRow[i].id;
        }
      }
      return this.http.put(this.baseUrl.concat('/apimaster/' + data.id + '/'), data)
        .pipe(map(data => {
          data['status'] = 2;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
    else {
      delete data['id']
      let initialItemRow = data.initialItemRow.filter(function (props) {
        delete props.id;
        return true;
      });

      return this.http.post(this.baseUrl.concat('/apimaster/'), data)
        .pipe(map(data => {
          data['status'] = 1;
          return data;
        }),
          catchError(this.errorHandler)
        );
    }
  }

  deleteDefineApi(value: any) {
    return this.http.put(this.baseUrl.concat(`/apimaster/${value.id}/`), value)
      .pipe(map(data => {
        data['status'] = 1;
        return data;
      }));
  }

  // Standard API 

  getStandardApiMaster() {
    return this.http.get<any[]>(`${this.baseUrl}/standardapimaster/`);
  }

  saveStandardApiData(data) {
    if (data.id) {
      for (var i = 0; i < data.initialItemRow.length; i++) {
        if (data.initialItemRow[i].id == '') {
          delete data.initialItemRow[i].id;
        }
      }
      return this.http.put(this.baseUrl.concat('/standardapimaster/' + data.id + '/'), data)
        .pipe(map(data => {
          data['status'] = 2;
          return data;
        }),
          catchError(this.errorHandler));
    }
    else {
      delete data['id'];
      let initialItemRow = data.initialItemRow.filter(function (props) {
        delete props.id;
        return true;
      });

      return this.http.post(this.baseUrl.concat('/standardapimaster/'), data)
        .pipe(map(data => {
          data['status'] = 1;
          return data;
        }),
          catchError(this.errorHandler));
    }
  }

  deleteStandardAPI(data: any) {
    return this.http.put(this.baseUrl.concat('/standardapimaster/' + data.id + '/'), data)
      .pipe(map(data => {
        data['status'] = 1;
        return data;
      }));
  }

  // Call for left panel values

}
