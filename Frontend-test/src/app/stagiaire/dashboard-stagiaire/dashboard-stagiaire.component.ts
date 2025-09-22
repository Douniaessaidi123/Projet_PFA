import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ProjetService } from '../../services/projet.service';
import { AuthService } from '../../services/auth.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-stagiaire',
  templateUrl: './dashboard-stagiaire.component.html',
  styleUrls: ['./dashboard-stagiaire.component.css']
})
export class DashboardStagiaireComponent implements OnInit, AfterViewInit {
  projet: any = null;
  taches: any[] = [];
  totalTasks = 0;
  completion = 0;
  prochaineDeadline: string | null = null;
  loading = true;
  error: string | null = null;

  @ViewChild('tachesChart') chartRef!: ElementRef<HTMLCanvasElement>;
  private chart: any;

  constructor(
    private projetService: ProjetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const stagiaireId = this.authService.getCurrentUserId();
    if (!stagiaireId) {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    this.projetService.getProjetByStagiaire(stagiaireId).subscribe({
      next: (projet: any) => {
        this.projet = projet;
        this.projetService.listTaches(projet.id).subscribe({
          next: (taches: any[]) => {
            this.taches = taches;
            this.calculateStats();
            this.loading = false;

            // ⚠️ On ne génère pas ici → on attend AfterViewInit
            setTimeout(() => this.generateChart(), 0);
          },
          error: () => {
            this.error = "Erreur lors du chargement des tâches";
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = "Aucun projet assigné à ce stagiaire";
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Double sécurité si le canvas existe déjà
    if (this.taches.length > 0) {
      this.generateChart();
    }
  }

  private calculateStats(): void {
    this.totalTasks = this.taches.length;
    const termine = this.taches.filter(t => t.etat === 'TERMINE').length;
    this.completion = this.totalTasks > 0 ? (termine / this.totalTasks) * 100 : 0;

    const deadlines = this.taches
      .filter(t => t.deadline)
      .map(t => new Date(t.deadline));
    if (deadlines.length > 0) {
      this.prochaineDeadline = deadlines.sort((a, b) => a.getTime() - b.getTime())[0].toISOString().split('T')[0];
    }
  }

  private generateChart(): void {
    const canvas = this.chartRef?.nativeElement;
    if (!canvas) {
      console.error("Canvas non trouvé !");
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const counts = {
      aFaire: this.taches.filter(t => t.etat === 'A_FAIRE').length,
      enCours: this.taches.filter(t => t.etat === 'EN_COURS').length,
      termine: this.taches.filter(t => t.etat === 'TERMINE').length,
      bloque: this.taches.filter(t => t.etat === 'BLOQUE').length
    };

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['À faire', 'En cours', 'Terminé', 'Bloqué'],
        datasets: [{
          data: [counts.aFaire, counts.enCours, counts.termine, counts.bloque],
          backgroundColor: ['#9e9e9e', '#1565c0', '#2e7d32', '#ef6c00']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }
}
