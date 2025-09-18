import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ProjetService } from '../services/projet.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.scss']
})
export class ProjetDetailComponent implements OnInit {

  projet: any;
  projetId!: number;
  taches: any[] = [];
  projetForm!: FormGroup;
  selectedFile: File | null = null;
  stagiaireForm!: FormGroup;
  tacheForm!: FormGroup;
  editForms: { [id: number]: FormGroup } = {};

  tabIndex: number = 0;


  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projetId = +idParam;
      this.chargerProjet();
      this.chargerTaches();
    }

     this.projetForm = this.fb.group({
       titre: [''],
       description: [''],
       dateDebut: [''],
       dateFin: ['']
     });


     this.stagiaireForm = this.fb.group({
         email: ['', [Validators.required, Validators.email]]
       });

    this.tacheForm = this.fb.group({
      titre: ['', Validators.required],
      deadline: ['', [Validators.required, this.minDateTodayValidator()]],
      etat: ['A_FAIRE', Validators.required],
      stagiaireEmail: [null]
    });

  }

private toISODate(d: any): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : (d as Date);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }


  encode(name: string): string {
    return encodeURIComponent(name ?? '');
  }

  chargerProjet(): void {
    this.projetService.getProjetById(this.projetId).subscribe({
      next: (data) => {
        this.projet = data;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erreur lors du chargement du projet', 'Fermer', { duration: 3000 });
      }
    });
  }

  affecterStagiaire(): void {
    if (this.stagiaireForm.invalid) return;
    const email = this.stagiaireForm.value.email;

    this.projetService.assignStagiaireByEmail(this.projetId, email).subscribe({
      next: () => {
        this.snackBar.open('Stagiaire affecté avec succès', 'Fermer', { duration: 3000 });
        this.stagiaireForm.reset();
        this.chargerProjet();
      },
      error: (err) => {
        const msg = err?.status === 404
          ? 'Aucun stagiaire trouvé avec cet email.'
          : 'Erreur lors de l’affectation du stagiaire';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
      }
    });
}

chargerTaches(): void {
  this.projetService.listTaches(this.projetId).subscribe({
    next: (list) => {
      this.taches = list ?? [];


      this.taches.forEach(t => {
        this.editForms[t.id] = this.fb.group({
          etat: [t.etat, Validators.required],
          deadline: [t.deadline ? new Date(t.deadline) : '', [Validators.required, this.minDateTodayValidator()]],
          stagiaireEmail: [t.stagiaireEmail ?? null]
        });
      });
    },
    error: () => this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 })
  });
}


  ajouterTache(): void {
    if (this.tacheForm.invalid) return;

    const dto = {
      ...this.tacheForm.value,
      projetId: this.projetId,
      deadline: this.toISODate(this.tacheForm.value.deadline)
    };

    this.projetService.createTache(dto).subscribe({
      next: () => {
        this.snackBar.open('Tâche ajoutée', 'Fermer', { duration: 2500 });
        this.tacheForm.reset({ etat: 'A_FAIRE', stagiaireEmail: null, deadline: '' });
        this.chargerTaches();
      },
      error: () => this.snackBar.open('Erreur lors de l’ajout', 'Fermer', { duration: 3500 })
    });
  }

saveTache(t: any): void {
  const fg = this.editForms[t.id];
  if (!fg || fg.invalid) return;

  const payload = {
    etat: fg.value.etat,
    deadline: this.toISODate(fg.value.deadline),
    stagiaireEmail: fg.value.stagiaireEmail ?? null
  };

  this.projetService.updateTache(t.id, payload).subscribe({
    next: () => {
      this.snackBar.open('Tâche mise à jour', 'Fermer', { duration: 2000 });
      this.chargerTaches();
    },
    error: () => this.snackBar.open('Erreur de mise à jour', 'Fermer', { duration: 3000 })
  });
}

resetTacheForm(t: any): void {
  const fg = this.editForms[t.id];
  if (!fg) return;
  fg.reset({
    etat: t.etat,
    deadline: t.deadline ? new Date(t.deadline) : '',
    stagiaireEmail: t.stagiaireEmail ?? null
  });
}


  supprimerTache(id: number): void {
    this.projetService.deleteTache(id).subscribe({
      next: () => {
        this.snackBar.open('Tâche supprimée', 'Fermer', { duration: 2000 });
        this.chargerTaches();
      },
      error: () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 })
    });
  }
// --- Validators ---
private minDateTodayValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const v = control.value;
    if (!v) return null;
    const d = new Date(v);
    d.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today ? { minDate: true } : null;
  };
}


labelEtat(etat: string): string {
  switch (etat) {
    case 'A_FAIRE':  return 'À faire';
    case 'EN_COURS': return 'En cours';
    case 'TERMINE':  return 'Terminée';
    case 'BLOQUE': return 'Bloqué';
    default:         return etat ?? '';
  }
}

etatClass(etat: string): string {
  switch (etat) {
    case 'A_FAIRE':  return 'etat-a-faire';
    case 'EN_COURS': return 'etat-en-cours';
    case 'TERMINE':  return 'etat-termine';
    case 'BLOQUE': return 'etat-bloque';
    default:         return '';
  }
}

onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
}

updateProjet(): void {
  if (!this.projetId) return;

  this.projetService.updateProjet(this.projetId, this.projetForm.value, this.selectedFile ?? undefined).subscribe({
    next: (data) => {
      this.snackBar.open('Projet mis à jour avec succès', 'Fermer', { duration: 3000 });
      this.projet = data;
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Erreur lors de la mise à jour du projet', 'Fermer', { duration: 3000 });
    }
  });
}

supprimerStagiaire(stagiaireId: number): void {
  if (!confirm("Voulez-vous vraiment retirer ce stagiaire du projet ?")) return;

  this.projetService.removeStagiaire(this.projetId, stagiaireId).subscribe({
    next: () => {
      this.snackBar.open('Stagiaire retiré avec succès', 'Fermer', { duration: 3000 });
      this.chargerProjet(); // recharger les stagiaires
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Erreur lors du retrait du stagiaire', 'Fermer', { duration: 3000 });
    }
  });
}


}
