import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../services/projet.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projets-component',
  templateUrl: './projets-component.component.html',
  styleUrls: ['./projets-component.component.css']
})
export class ProjetsComponentComponent implements OnInit {
  public projets: any[] = [];       // Liste affichée (filtrée)
  private allProjets: any[] = [];   // Liste complète
  anneeFiltre: number | null = null;
  anneesDisponibles: number[] = [];

  constructor(
    private projetService: ProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const encadrantId = this.authService.getCurrentUserId();
    if (encadrantId !== null) {
      this.projetService.getProjetsByEncadrant(encadrantId).subscribe({
        next: (data) => {
          this.allProjets = data;
          this.projets = [...this.allProjets]; // initialisation
          this.anneesDisponibles = [...new Set(
            data.map(p => new Date(p.dateDebut).getFullYear())
          )];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des projets de l\'encadrant', err);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  voirDetails(id: number): void {
    this.router.navigate(['/encadrant/projets', id]);
  }

  filtrerProjets(): void {
    if (this.anneeFiltre) {
      this.projets = this.allProjets.filter(p =>
        new Date(p.dateDebut).getFullYear() === this.anneeFiltre
      );
    } else {
      this.projets = [...this.allProjets]; // réinitialise si "Toutes les années"
    }
  }
}
