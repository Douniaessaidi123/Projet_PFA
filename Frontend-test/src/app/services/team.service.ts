import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service'; // ton User déjà défini dans AuthService

export interface Team {
  projetId: number;
  projetTitre: string;
  encadrant: User;
  stagiaires: User[];
  teamCreated: boolean;
}

export interface Projet {
  id: number;
  titre: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private apiUrl = 'http://localhost:8081/api/projets';

  constructor(private http: HttpClient) {}

  // Récupérer les canaux déjà créés (pour sidebar)
  getTeams(encadrantId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/encadrant/${encadrantId}/teams`);
  }

  // Récupérer les projets sans canal créé (pour formulaire "Créer canal")
  getProjectsWithoutChannel(encadrantId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/encadrant/${encadrantId}/projects`);
  }

  // Créer un canal pour un projet
  createChannel(projetId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${projetId}/create-channel`, {});
  }

// ✅ Récupérer les groupes visibles pour un stagiaire (canaux déjà créés)
getTeamsForStagiaire(stagiaireId: number): Observable<Team[]> {
  return this.http.get<Team[]>(`${this.apiUrl}/stagiaire/${stagiaireId}/teams`);
}

}
