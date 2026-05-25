import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ArchivoSubidoResponse } from './api-models';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  subirReporte(file: File): Observable<ArchivoSubidoResponse> {
    return this.subir(file, 'reportes');
  }

  subirReportes(files: File[]): Observable<ArchivoSubidoResponse> {
    return this.subirVarios(files, 'reportes');
  }

  subirCaso(file: File): Observable<ArchivoSubidoResponse> {
    return this.subir(file, 'casos');
  }

  subirCasos(files: File[]): Observable<ArchivoSubidoResponse> {
    return this.subirVarios(files, 'casos');
  }

  private subir(file: File, carpeta: 'reportes' | 'casos'): Observable<ArchivoSubidoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<ArchivoSubidoResponse>>(`${environment.apiBaseUrl}/uploads/${carpeta}`, formData)
      .pipe(map((res) => res.data));
  }

  private subirVarios(files: File[], carpeta: 'reportes' | 'casos'): Observable<ArchivoSubidoResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.http.post<ApiResponse<ArchivoSubidoResponse>>(`${environment.apiBaseUrl}/uploads/${carpeta}`, formData)
      .pipe(map((res) => res.data));
  }
}
