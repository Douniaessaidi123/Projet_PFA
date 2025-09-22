import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';        // <-- ajouter FormsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // <-- Angular Animations
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { EncadrantComponent } from './encadrant/encadrant.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AccueilComponentComponent } from './accueil-component/accueil-component.component';
import { ProjetsComponentComponent } from './projets-component/projets-component.component';
import { DashboardComponentComponent } from './dashboard-component/dashboard-component.component';
import { SettingsComponentComponent } from './settings-component/settings-component.component';
import { CompteComponentComponent } from './compte-component/compte-component.component';
import { AjouterProjetComponentComponent } from './ajouter-projet-component/ajouter-projet-component.component';
import { ProjetDetailComponent } from './projet-detail/projet-detail.component';
import { DiscussionComponent } from './discussion/discussion.component';

import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { WebsocketService } from './services/websocket.service';
import { RegisterComponent } from './register/register.component';
import { EspaceStagiaireComponent } from './stagiaire/espace-stagiaire/espace-stagiaire.component';
import { EspaceAdminComponent } from './admin/espace-admin/espace-admin.component';
import { ProjetsAdminComponent } from './admin/projets-admin/projets-admin.component';
import { ProjetsStagiaireComponent } from './stagiaire/projet-stagiaire/projet-stagiaire.component';
import { ProjetDetailStagiaireComponent } from './stagiaire/projet-detail-stagiaire/projet-detail-stagiaire.component';
import { ProjetDetailAdminComponent } from './admin/projet-detail-admin/projet-detail-admin.component';
import { DashboardAdminComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { DashboardStagiaireComponent } from './stagiaire/dashboard-stagiaire/dashboard-stagiaire.component';
import { AcceuilAdminComponent } from './admin/acceuil-admin/acceuil-admin.component';
import { AccueilStagiaireComponent } from './stagiaire/accueil-stagiaire/accueil-stagiaire.component';
import { CreateTeamDialogComponent } from './discussion/create-team-dialog/create-team-dialog.component';
import { CreateChannelDialogComponent } from './discussion/create-channel-dialog/create-channel-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    EncadrantComponent,
    AccueilComponentComponent,
    ProjetsComponentComponent,
    DashboardComponentComponent,
    SettingsComponentComponent,
    CompteComponentComponent,
    AjouterProjetComponentComponent,
    ProjetDetailComponent,
    DiscussionComponent,
    RegisterComponent,
    EspaceStagiaireComponent,
    EspaceAdminComponent,
    ProjetsAdminComponent,
    ProjetsStagiaireComponent,
    ProjetDetailStagiaireComponent,
    ProjetDetailAdminComponent,
    DashboardAdminComponent,
    DashboardStagiaireComponent,
    AcceuilAdminComponent,
    AccueilStagiaireComponent,
    CreateTeamDialogComponent,
    CreateChannelDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    FormsModule,                 // <-- Ajouté pour [(ngModel)]
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,     // <-- Ajouté pour Angular Material animations

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSelectModule,
    MatOptionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule

  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
