import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-projets-admin',
  templateUrl: './projets-admin.component.html',
  styleUrls: ['./projets-admin.component.css']
})
export class ProjetsAdminComponent {
  role: string = '';
  searchEmail: string = '';
  users: any[] = [];
  projets: any[] = [];
  selectedUser: any = null;

  constructor(private userService: UserService) {}

  // Quand on choisit un rôle
  onRoleChange(role: string) {
    this.role = role;
    this.users = [];
    this.projets = [];
    this.selectedUser = null;

    this.userService.getUsersByRole(role).subscribe({
      next: (data: any[]) => this.users = data,
      error: (err) => console.error(err)
    });
  }

  // Recherche par email (uniquement si rôle choisi)
  searchByEmail() {
    if (!this.role) {
      alert("Veuillez d'abord sélectionner un rôle");
      return;
    }

    if (!this.searchEmail) return;

    this.users = [];
    this.projets = [];
    this.selectedUser = null;

    this.userService.getByEmail(this.searchEmail).subscribe({
      next: (user: any) => {
        if (user && user.role === this.role) {
          this.users = [user];
        } else {
          this.users = [];
          alert("Aucun utilisateur trouvé avec cet email et ce rôle");
        }
      },
      error: (err) => console.error(err)
    });
  }

  voirProjets(user: any) {
    this.selectedUser = user;
    this.projets = [];

    if (this.role === 'ENCADRANT') {
      this.userService.getProjetsEncadres(user.id).subscribe({
        next: (data: any[]) => this.projets = data,
        error: (err) => console.error(err)
      });
    } else if (this.role === 'STAGIAIRE') {
      this.userService.getProjetStagiaire(user.id).subscribe({
        next: (data: any) => this.projets = data ? [data] : [],
        error: (err) => console.error(err)
      });
    }
  }
}
