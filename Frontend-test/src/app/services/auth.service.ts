import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departement: string;
  photo?: string | null;
  // autres champs éventuels
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  public isAuthenticated = false;
  public username = '';
  public roles: string[] = [];

  private apiUrl = `${environment.apiUrl}/users`;
  private apiurl1='http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      if (this.currentUser) {
        this.isAuthenticated = true;
        this.roles = this.currentUser.role ? [this.currentUser.role] : [];
        this.username = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiurl1}/login`, { email, password }).pipe(
      tap(user => {
        this.setUser(user);
      })
    );
  }

  setUser(user: User): void {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.roles = user.role ? [user.role] : [];
    this.username = `${user.firstName} ${user.lastName}`;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        if (this.currentUser) {
          this.isAuthenticated = true;
          this.roles = this.currentUser.role ? [this.currentUser.role] : [];
          this.username = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
      }
    }
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated && this.currentUser !== null;
  }

getCurrentUserId(): number | null {
  return this.currentUser?.id ?? null;
}

  logout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.roles = [];
    this.username = '';
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }
}
