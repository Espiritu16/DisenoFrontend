import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  ChatbotConversationSummary,
  ChatbotDayHistory,
  ChatbotRequest,
  ChatbotResponse
} from './api-models';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly base = `${environment.apiBaseUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  enviarMensaje(payload: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ApiResponse<ChatbotResponse>>(`${this.base}/mensajes`, payload)
      .pipe(map((res) => res.data));
  }

  listarConversaciones(): Observable<ChatbotConversationSummary[]> {
    return this.http.get<ApiResponse<ChatbotConversationSummary[]>>(`${this.base}/conversaciones`)
      .pipe(map((res) => res.data));
  }

  obtenerHistorial(fechaConversacion: string): Observable<ChatbotDayHistory> {
    return this.http.get<ApiResponse<ChatbotDayHistory>>(`${this.base}/conversaciones/${fechaConversacion}/mensajes`)
      .pipe(map((res) => res.data));
  }
}
