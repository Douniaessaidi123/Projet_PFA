import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model'

@Component({
  selector: 'app-espace-admin',
  templateUrl: './espace-admin.component.html',
  styleUrls: ['./espace-admin.component.css']
})
export class EspaceAdminComponent {
user?: User;

  constructor(
    public authService: AuthService,
    private users: UserService
  ) {}

  ngOnInit(): void {
    const me = this.users.getMe();
    if (me?.id) {
      this.users.getById(me.id).subscribe(u => this.user = u);
    }
  }

  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
    }
  }

  /** Initiale si pas de photo */
  get initial(): string {
    const s = (this.user?.firstName) ?? (this.user?.lastName) ?? 'A';
    return s.slice(0, 1).toUpperCase();
  }

  /** URL de la photo */
  photoUrl(): string {
    const f = this.user?.photo;
    return f ? this.users.getPhotoUrl(f) : '';
  }

  onImgError(e: Event): void {
    const el = e.target as HTMLImageElement | null;
    if (el) el.style.display = 'none';
  }
}

