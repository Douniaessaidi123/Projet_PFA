// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMe(): any | null {
    // Essaie d'abord 'currentUser'
    let raw = localStorage.getItem('currentUser');
    if (!raw) {
      // sinon essaie 'user' (clé que tu utilises actuellement)
      raw = localStorage.getItem('user');
    }
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  /** Récupérer un utilisateur par id */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  /** Récupérer par email via /search */
  getByEmail(email: string): Observable<any | null> {
    const params = new HttpParams().set('keyword', email);
    return this.http.get<any[]>(`${this.api}/search`, { params }).pipe(
      map(list => list?.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) ?? null)
    );
  }

  /** Liste “tous” les users (search avec keyword vide => renvoie tout) */
  getAllUsers(): Observable<any[]> {
    const params = new HttpParams().set('keyword', '');
    return this.http.get<any[]>(`${this.api}/search`, { params });
  }

  /** Upload avatar (multipart/form-data) */
  uploadPhoto(id: number, file: File): Observable<{ photo: string; url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.put<{ photo: string; url: string }>(`${this.api}/${id}/photo`, fd);

  }

  /** URL d’accès direct à la photo */
  getPhotoUrl(fileName: string): string {
    return `${this.api}/photos/${encodeURIComponent(fileName)}`;
  }

 getUsersByRole(role: string) {
   return this.http.get<any[]>(`${this.api}/role/${role}`);
 }

 getProjetsEncadres(id: number) {
   return this.http.get<any[]>(`${this.api}/${id}/projets-encadres`);
 }

 getProjetStagiaire(id: number) {
   return this.http.get<any>(`${this.api}/${id}/projet-stagiaire`);
 }


}
