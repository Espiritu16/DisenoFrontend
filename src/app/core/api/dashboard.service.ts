import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, TableroKpi } from './api-models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  kpis(): Observable<TableroKpi> {
    return this.http.get<ApiResponse<TableroKpi>>(`${environment.apiBaseUrl}/dashboard/kpis`).pipe(map((res) => res.data));
  }
}
