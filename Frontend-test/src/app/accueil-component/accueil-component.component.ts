import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../services/projet.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-accueil-component',
  templateUrl: './accueil-component.component.html',
  styleUrls: ['./accueil-component.component.css']
})
export class AccueilComponentComponent implements OnInit {
  projetsCount = 0;
  stagiairesCount = 0;
  projetsEnCours = 0;
  derniersProjets: any[] = [];

  constructor(
    private projetService: ProjetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const encadrantId = this.authService.getCurrentUserId();

    if (encadrantId) {
      this.projetService.getProjetsByEncadrant(encadrantId).subscribe({
        next: (projets) => {
          // Nombre total
          this.projetsCount = projets.length;

          // Nombre de projets en cours (calculés par dates)
          this.projetsEnCours = projets.filter((p: any) => this.isEnCours(p)).length;

          // Collecter les stagiaires uniques
          const stagiaires = new Set<string>();
          projets.forEach((p: any) =>
            p.stagiaires?.forEach((s: any) => stagiaires.add(s.email))
          );
          this.stagiairesCount = stagiaires.size;

          // Derniers projets créés (par createdAt)
          this.derniersProjets = projets
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
        },
        error: (err) => {
          console.error("Erreur lors du chargement des projets", err);
        }
      });
    }
  }

  // Vérifie si un projet est en cours (entre date début et fin)
  isEnCours(projet: any): boolean {
    const today = new Date();
    const debut = new Date(projet.dateDebut);
    const fin = new Date(projet.dateFin);
    return debut <= today && fin >= today;
  }

  // Retourne l’état d’un projet
  getEtatProjet(projet: any): string {
    const today = new Date();
    const debut = new Date(projet.dateDebut);
    const fin = new Date(projet.dateFin);

    if (fin < today) return 'Terminé';
    if (debut > today) return 'Pas commencé';
    return 'En cours';
  }


}
