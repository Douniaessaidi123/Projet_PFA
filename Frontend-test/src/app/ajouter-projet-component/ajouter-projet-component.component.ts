import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjetService } from '../services/projet.service';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-ajouter-projet-component',
  templateUrl: './ajouter-projet-component.component.html',
  styleUrls: ['./ajouter-projet-component.component.scss']
})
export class AjouterProjetComponentComponent {

  projetForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private projetService: ProjetService,
    private router: Router
  ) {
    this.projetForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Fichier sélectionné :', this.selectedFile);
  }
formatDate(date: any): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Résultat : "2025-08-05"
}


  onSubmit() {
    if (this.projetForm.invalid) {
      this.projetForm.markAllAsTouched();
      return;
    }

    const encadrantId = this.authService.getCurrentUserId();
    if (!encadrantId) {
      this.snackBar.open("Encadrant non connecté", 'Fermer', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.projetForm.value.titre);
    formData.append('description', this.projetForm.value.description);
    formData.append('dateDebut', this.formatDate(this.projetForm.value.dateDebut));
    formData.append('dateFin', this.formatDate(this.projetForm.value.dateFin));
    formData.append('encadrantId', encadrantId.toString());

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.projetService.createProjet(formData).subscribe({
      next: () => {
        this.snackBar.open('Projet ajouté avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/projets']);
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Erreur lors de l\'ajout du projet', 'Fermer', { duration: 4000 });
      }
    });
  }

}
