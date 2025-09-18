import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  departement?: string;
  photo?: string;
}



@Component({
  selector: 'app-compte-component',
  templateUrl: './compte-component.component.html',
  styleUrls: ['./compte-component.component.css']
})
export class CompteComponentComponent implements OnInit {
  user?: User;
  userId?: number;

  selectedFile?: File;
  uploading = false;

  constructor(
    private users: UserService,
    private snack: MatSnackBar
  ) {}

 ngOnInit(): void {
   const me = this.users.getMe();
   console.log('[Compte] utilisateur connecté localStorage =', me);

   if (me?.id) {
     this.userId = me.id;
     this.loadById(me.id);
   } else {
     this.snack.open('Utilisateur non connecté.', 'Fermer', { duration: 3000 });
   }
 }



  /** Normalise l’utilisateur selon les champs backend */
  private normalize(u: any): User {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      departement: u.departement,
      photo: u.photo
    };
  }

  /** Charge les infos de l’utilisateur depuis l’API */
  private loadById(id: number): void {
    this.users.getById(id).subscribe({
      next: u => {
        this.user = this.normalize(u);
        console.log('[Compte] profil chargé =', this.user);
      },
      error: err => {
        console.error('[Compte] erreur getById', err);
        this.snack.open(`Erreur profil (id=${id})`, 'Fermer', { duration: 4000 });
      }
    });
  }


  /** Initiale à afficher si pas d’image */
  get initial(): string {
    const s = (this.user?.firstName) ?? (this.user?.lastName) ?? 'A';
    return s.slice(0, 1).toUpperCase();
  }

  /** Retourne l’URL de la photo de profil */
  photoUrl(): string {
    const f = this.user?.photo;
    return f ? this.users.getPhotoUrl(f) : '';
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement | null;
    if (el) el.style.display = 'none';
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? undefined;
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.userId) return;
    this.uploading = true;
    this.users.uploadPhoto(this.userId, this.selectedFile).subscribe({
      next: res => {
        this.user = { ...(this.user ?? {}), photo: res.photo };
        this.selectedFile = undefined;
        this.snack.open('Photo mise à jour', 'Fermer', { duration: 2500 });
      },
      error: err => {
        console.error('[Compte] uploadPhoto error', err);
        this.snack.open('Échec du téléversement', 'Fermer', { duration: 3000 });
      },
      complete: () => this.uploading = false
    });
  }
}
