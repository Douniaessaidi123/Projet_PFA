import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

type StagiaireDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type ProjetDTO = {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  file?: string | null;
  encadrantNomComplet?: string | null;
  stagiaires: StagiaireDTO[];
};

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

 private baseUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  // Obtenir tous les projets
  getAllProjets(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Obtenir les projets d’un encadrant
  getProjetsByEncadrant(encadrantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/encadrant/${encadrantId}`);
  }

  // Obtenir un projet par ID
  getProjetById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Créer un projet avec un stagiaire
  createProjet(projet: any, stagiaireId?: number): Observable<any> {
    const url = stagiaireId ? `${this.baseUrl}/create?stagiaireId=${stagiaireId}` : `${this.baseUrl}/create`;
    return this.http.post<any>(url, projet);
  }

  // Affecter un stagiaire à un projet
   assignStagiaireByEmail(projetId: number, email: string): Observable<any> {
      return this.http.put(
        `${this.baseUrl}/${projetId}/assign-stagiaire-by-email`, {}, { params: { email } });
    }

   // === Tâches ===
     createTache(dto: any): Observable<any> {
       return this.http.post(`${this.baseUrl}/taches`, dto);
     }

     listTaches(projetId: number): Observable<any[]> {
       return this.http.get<any[]>(`${this.baseUrl}/${projetId}/taches`);
     }

     updateTache(tacheId: number, dto: any): Observable<any> {
       return this.http.put(`${this.baseUrl}/taches/${tacheId}`, dto);
     }

     deleteTache(tacheId: number): Observable<any> {
       return this.http.delete(`${this.baseUrl}/taches/${tacheId}`);
     }
   // ⚠️ À adapter au nom réel de ton endpoint backend
     listProjetsByEncadrant(encadrantId: number): Observable<any[]> {
       // Exemple d’URL : /projets/by-encadrant/{id}
       return this.http.get<any[]>(`${this.baseUrl}/by-encadrant/${encadrantId}`);
     }

     getProjetByStagiaire(stagiaireId: number): Observable<any> {
       return this.http.get<any>(`${this.baseUrl}/stagiaire/${stagiaireId}`);
     }


   updateTacheStatut(id: number, nouveauStatut: string) {
     return this.http.put(`${this.baseUrl}/taches/${id}/statut`, { statut: nouveauStatut });
   }

  getStatsForEncadrant(id: number) {
    return this.http.get<any>(`${this.baseUrl}/encadrant/${id}/stats`);
  }

  getGlobalStats() {
    return this.http.get<any>(`${this.baseUrl}/stats/global`);
  }

  updateProjet(id: number, projet: any, file?: File) {
    const formData = new FormData();

    if (projet.titre) formData.append('titre', projet.titre);
    if (projet.description) formData.append('description', projet.description);

    if (projet.dateDebut) {
      formData.append('dateDebut', this.toIsoDate(projet.dateDebut));
    }
    if (projet.dateFin) {
      formData.append('dateFin', this.toIsoDate(projet.dateFin));
    }

    if (file) {
      formData.append('file', file);
    }

    return this.http.put<any>(`${this.baseUrl}/${id}`, formData);
  }

  private toIsoDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // <-- garantit yyyy-MM-dd
  }

  removeStagiaire(projetId: number, stagiaireId: number) {
    return this.http.delete(`${this.baseUrl}/${projetId}/stagiaires/${stagiaireId}`);
  }

  getDerniersProjets(encadrantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/encadrant/${encadrantId}/last5`);
  }



}
