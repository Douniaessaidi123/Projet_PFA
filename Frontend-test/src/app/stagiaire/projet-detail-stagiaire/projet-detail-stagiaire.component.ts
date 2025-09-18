import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { environment } from '../../../environments/environment';
import { of, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projet-detail-stagiaire',
  templateUrl: './projet-detail-stagiaire.component.html',
  styleUrls: ['./projet-detail-stagiaire.component.css']
})
export class ProjetDetailStagiaireComponent implements OnInit {
  projet: any = null;
  taches: any[] = [];
  stagiaireId: number | null = null;; // id du stagiaire connecté

  loading = true;
  error: string | null = null;
  tachesError: string | null = null;

  apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.stagiaireId = this.authService.getCurrentUserId();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Projet introuvable.';
      this.loading = false;
      return;
    }

    forkJoin({
      projet: this.projetService.getProjetById(id).pipe(
        catchError(err => {
          console.error(err);
          this.error = 'Erreur lors du chargement du projet.';
          return of(null);
        })
      ),
      taches: this.projetService.listTaches(id).pipe(
        catchError(err => {
          console.error(err);
          this.tachesError = 'Erreur lors du chargement des tâches.';
          return of([]);
        })
      )
    })
    .pipe(finalize(() => (this.loading = false)))
    .subscribe(({ projet, taches }) => {
      this.projet = projet;
      this.taches = Array.isArray(taches) ? taches : (taches ? [taches] : []);
    });
  }

  // --------- Helpers affichage ---------
  encadrantLabel(): string {
    return this.projet?.encadrantNomComplet || this.projet?.encadrant || 'Encadrant inconnu';
  }

  hasFile(): boolean {
    return !!this.projet?.file;
  }

  fileUrl(): string {
    return `${this.apiUrl}/projets/uploads/${encodeURIComponent(this.projet?.file)}`;
  }

  taskIcon(t: any): string {
    const raw = (t?.statut ?? t?.status ?? t?.etat ?? '').toString().toLowerCase();
    if (raw.includes('term') || raw === 'done' || raw === 'completed') return 'check_circle';
    if (raw.includes('cours') || raw.includes('progress')) return 'autorenew';
    if (raw.includes('blo') || raw.includes('block')) return 'block';
    return 'radio_button_unchecked';
  }

  taskClass(t: any): string {
    const icon = this.taskIcon(t);
    if (icon === 'check_circle') return 'done';
    if (icon === 'autorenew') return 'progress';
    if (icon === 'block') return 'blocked';
    return 'todo';
  }

  taskTitle(t: any): string {
    return t?.titre || t?.nom || t?.libelle || t?.title || 'Tâche';
  }

  taskDesc(t: any): string {
    return t?.description || '';
  }

  taskDueDate(t: any): string | null {
    return (t?.dateEcheance || t?.dueDate || t?.deadline) ?? null;
  }

  taskAssignee(t: any): string | null {
    return t?.assigneANom || t?.assigneA || t?.assignTo || t?.owner || null;
  }

  // Vérifie si la tâche est modifiable par le stagiaire connecté
  peutModifier(t: any): boolean {
    return t.stagiaireId === this.stagiaireId;
  }

  changerEtat(t: any, nouvelEtat: string) {
    this.projetService.updateTacheStatut(t.id, nouvelEtat).subscribe({
      next: () => {
        t.etat = nouvelEtat;
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la mise à jour de l'état.");
      }
    });
  }
}
