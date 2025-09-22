// src/app/services/group.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Group {
  id?: number;         // optionnel, généré par le backend
  name: string;
  memberIds: number[]; // uniquement les IDs des membres
  members?: any[];     // facultatif, pour recevoir les détails du backend
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'http://localhost:8081/api/groups'; // ton endpoint backend

  constructor(private http: HttpClient) {}

  // Créer un groupe
  createGroup(group: { name: string; memberIds: number[] }): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/create`, group);
  }

  // Récupérer tous les groupes
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}`);
  }

  // Récupérer un groupe par ID
  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }
}
