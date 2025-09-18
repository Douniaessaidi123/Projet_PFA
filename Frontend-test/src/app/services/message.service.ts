import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './auth.service';

export interface ChatMessage {
  id?: number;
  content: string;
  timestamp: string;
  type: string; // e.g. CHAT, PRIVATE_CHAT, GROUP_CHAT
  sender: User;
  receiver?: User;
  roomId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = 'http://localhost:8081/api/messages';

  constructor(private http: HttpClient) {}

  // ✅ Récupère l’historique global (messages publics uniquement)
  getMessageHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/history`).pipe(
      catchError(err => {
        console.error('Erreur lors de la récupération de l’historique public :', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Récupère l’historique des messages privés entre deux utilisateurs
  getPrivateHistory(senderEmail: string, receiverEmail: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.baseUrl}/private?senderEmail=${encodeURIComponent(senderEmail)}&receiverEmail=${encodeURIComponent(receiverEmail)}`
    ).pipe(
      catchError(err => {
        console.error('Erreur lors de la récupération de l’historique privé :', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Récupère l’historique des messages d’un groupe (par projet)
  getGroupMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/history/group?roomId=${roomId}`).pipe(
      catchError(err => {
        console.error('Erreur lors de la récupération des messages de groupe :', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ Envoie un message (public, privé ou groupe)
  sendMessageToBackend(
    senderEmail: string,
    content: string,
    type: string = 'CHAT', // CHAT | PRIVATE_CHAT | GROUP_CHAT
    receiverEmail?: string,
    roomId?: string
  ): Observable<any> {
    const message: any = { senderEmail, content, type };

    if (receiverEmail) {
      message.receiverEmail = receiverEmail;
    }

    if (roomId) {
      message.roomId = roomId;
    }

    return this.http.post(`${this.baseUrl}/send`, message).pipe(
      catchError(err => {
        console.error('Erreur lors de l’envoi du message :', err);
        return throwError(() => err);
      })
    );
  }
}

