import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjetService } from '../../services/projet.service';           // <= remonte d’un cran (../../)
import { AuthService } from '../../services/auth.service';               // <= remonte d’un cran (../../)
import { environment } from '../../../environments/environment';         // <= remonte de deux (../../../)

@Component({
  selector: 'app-projet-stagiaire',
  templateUrl: './projet-stagiaire.component.html',
  styleUrls: ['./projet-stagiaire.component.css']                        // <= tableau et nom correct
})
export class ProjetsStagiaireComponent implements OnInit {               // <= garde le S partout
  projets: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private projetService: ProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stagiaireId = this.authService.getCurrentUserId?.();
    if (!stagiaireId) {
      this.error = 'Utilisateur non connecté.';
      this.loading = false;
      return;
    }

    this.projetService.getProjetByStagiaire(stagiaireId).subscribe({
      next: (list: any[]) => {
        this.projets = Array.isArray(list) ? list : (list ? [list] : []);
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des projets.';
        this.loading = false;
      }
    });
  }

  encadrantLabel(p: any): string {
    return p?.encadrantNomComplet || p?.encadrant || 'Encadrant inconnu';
  }

  goToDetails(p: any) {
    this.router.navigate(['/projets', p.id]);
  }

  downloadCahier(p: any) {
    if (!p?.file) return;
    const url = `${environment.apiUrl}/projets/uploads/${encodeURIComponent(p.file)}`;
    window.open(url, '_blank');
  }
}
