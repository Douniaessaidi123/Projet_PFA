import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  mode: 'register' | 'login' = 'register';

  registerForm!: FormGroup;
  loginForm!: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' | 'warning' = 'error'; // ✅ Ajout de messageType
  errorMessage: string = '';

  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'ENCADRANT', label: 'Encadrant' },
    { value: 'STAGIAIRE', label: 'Stagiaire' }
  ];
  departements = [
    { value: 'DEVELOPPEMENT', label: 'DEVELOPPEMENT' },
    { value: 'INFRASTRUCTURET', label: 'INFRASTRUCTURE' },
    { value: 'RH', label: 'RH' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Formulaire d'inscription
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      role: [this.roles[0].value, Validators.required],
      departement:[this.departements[0].value,Validators.required]
    });

    // Formulaire de connexion
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', Validators.required]
    });
  }

  // ✅ Méthode pour afficher les messages avec type
  private showMessage(text: string, type: 'success' | 'error' | 'warning' = 'error') {
    this.message = text;
    this.messageType = type;

    // Auto-hide message après 5 secondes
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  // Inscription
  onRegister() {
    if (this.registerForm.invalid) {
      this.showMessage('❌ Formulaire invalide. Veuillez remplir tous les champs.', 'error');
      return;
    }

    const v = this.registerForm.value;

    const payload = {
      lastName:  v.nom,
      firstName: v.prenom,
      email:     v.email,
      password:  v.mot_de_passe,
      role:      v.role,
      departement: v.departement
    };

    this.http.post('http://localhost:8080/api/auth/register', payload).subscribe({
      next: () => {
        this.showMessage('✅ Merci pour votre inscription. Veuillez attendre la validation.', 'success');
        this.registerForm.reset();
      },
      error: (error) => {
        if (error.status === 500 && error.error?.message?.includes('Email déjà utilisé')) {
          this.showMessage('❌ Cet email est déjà utilisé.', 'error');
        } else {
          this.showMessage('❌ Échec de l\'inscription. Veuillez réessayer.', 'error');
        }
      }
    });
  }

  // Connexion
  onLogin() {
    if (this.loginForm.invalid) {
      this.showMessage('❌ Veuillez remplir correctement tous les champs.', 'error');
      return;
    }

    const { email, mot_de_passe } = this.loginForm.value;

    this.authService.login(email, mot_de_passe).subscribe({
      next: (user) => {
        this.authService.setUser(user);
        console.log('Connexion réussie, currentUser:', this.authService.getUser());

        this.showMessage('✅ Connexion réussie! direction...', 'success');

        // Redirection selon rôle après un petit délai
        setTimeout(() => {
          switch (user.role) {
            case 'ENCADRANT':
              this.router.navigateByUrl('/encadrant');
              break;
            case 'STAGIAIRE':
              this.router.navigateByUrl('/stagiaire');
              break;
            case 'ADMIN':
              this.router.navigateByUrl('/admin');
                break;
            default:
              this.router.navigateByUrl('/');
          }
        }, 1500);
      },
      error: () => {
        this.showMessage('❌ Email ou mot de passe incorrect.', 'error');
      }
    });
  }
}
