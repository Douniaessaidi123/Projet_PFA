import { Component, OnInit } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service'; // ⚠️ assure-toi d’avoir ce service
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  encadrants: any[] = [];
  selectedEncadrantId: number | null = null;

  stats: any = {};
  loading = true;
  error: string | null = null;
  objectKeys = Object.keys;

  totalTasks = 0;
  avgCompletion = 0;

  constructor(
    private projetService: ProjetService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Charger tous les encadrants
    this.userService.getUsersByRole('ENCADRANT').subscribe({
      next: (data: any[]) => this.encadrants = data,
      error: (err) => console.error(err)
    });
    this.loading = false;
  }

  // Lorsqu’on change d’encadrant
  onEncadrantChange(encadrantId: number) {
    this.selectedEncadrantId = encadrantId;
    this.loading = true;

    this.projetService.getStatsForEncadrant(encadrantId).subscribe({
      next: (data: any) => {
        this.stats = data;
        this.calculateGlobalStats();
        this.loading = false;

        // Nettoyer les anciens graphiques avant de recréer
        setTimeout(() => {
          for (let project of Object.keys(this.stats)) {
            const s = this.stats[project];
            new Chart(`chart-${project}`, {
              type: 'doughnut',
              data: {
                labels: ['À faire', 'En cours', 'Terminé', 'Bloqué'],
                datasets: [{
                  data: [s.aFaire, s.enCours, s.termine, s.bloque],
                  backgroundColor: ['#9e9e9e', '#1565c0', '#2e7d32', '#ef6c00']
                }]
              },
              options: {
                plugins: { legend: { position: 'bottom' } }
              }
            });
          }
        }, 0);
      },
      error: (err: any) => {
        console.error(err);
        this.error = "Erreur lors du chargement des statistiques de l'encadrant";
        this.loading = false;
      }
    });
  }

  private calculateGlobalStats(): void {
    let totalTermine = 0;
    let total = 0;

    for (let project of Object.keys(this.stats)) {
      total += this.stats[project].total;
      totalTermine += this.stats[project].termine;
    }

    this.totalTasks = total;
    this.avgCompletion = total > 0 ? (totalTermine / total) * 100 : 0;
  }
}
