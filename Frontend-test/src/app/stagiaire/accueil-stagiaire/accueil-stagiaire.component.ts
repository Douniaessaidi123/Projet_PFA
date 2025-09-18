import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-accueil-stagiaire',
  templateUrl: './accueil-stagiaire.component.html',
  styleUrls: ['./accueil-stagiaire.component.css']
})
export class AccueilStagiaireComponent implements OnInit {
  projet: any | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private projetService: ProjetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const stagiaireId = this.authService.getCurrentUserId();

    if (!stagiaireId) {
      this.error = "Utilisateur non connecté.";
      this.loading = false;
      return;
    }

    this.projetService.getProjetByStagiaire(stagiaireId).subscribe({
      next: (p) => {
        this.projet = p;
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du projet stagiaire", err);
        this.error = "Aucun projet trouvé.";
        this.loading = false;
      }
    });
  }

  // Calculer état du projet
  getEtatProjet(projet: any): string {
    const today = new Date();
    const debut = new Date(projet.dateDebut);
    const fin = new Date(projet.dateFin);

    if (fin < today) return 'Terminé';
    if (debut > today) return 'Pas encore commencé';
    return 'En cours';
  }
}
