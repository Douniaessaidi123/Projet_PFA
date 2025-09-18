import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../services/projet.service';

@Component({
  selector: 'app-acceuil-admin',
  templateUrl: './acceuil-admin.component.html',
  styleUrls: ['./acceuil-admin.component.css']
})
export class AcceuilAdminComponent implements OnInit {
  totalProjets = 0;
  totalStagiaires = 0;
  totalEncadrants = 0;
  globalStats: any = {};
  derniersProjets: any[] = [];

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    // Statistiques globales
    this.projetService.getGlobalStats().subscribe({
      next: (stats) => {
        this.totalProjets = stats.projets;
        this.totalEncadrants = stats.encadrants;
        this.totalStagiaires = stats.stagiaires;
      },
      error: (err) => console.error("Erreur stats globales", err)
    });


    // Derniers projets
    this.projetService.getAllProjets().subscribe({
      next: (projets) => {
        this.derniersProjets = projets
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      }
    });
  }
}
