import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { of, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-projet-detail-admin',
  templateUrl: './projet-detail-admin.component.html',
  styleUrls: ['./projet-detail-admin.component.css']
})
export class ProjetDetailAdminComponent implements OnInit {
  projet: any = null;
  taches: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
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
          return of([]);
        })
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ projet, taches }) => {
        this.projet = projet;
        this.taches = taches || [];
      });
  }
}
