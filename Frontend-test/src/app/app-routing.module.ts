import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponentComponent } from './accueil-component/accueil-component.component';
import { ProjetsComponentComponent } from './projets-component/projets-component.component';
import { DashboardComponentComponent } from './dashboard-component/dashboard-component.component';
import { SettingsComponentComponent } from './settings-component/settings-component.component';
import { CompteComponentComponent } from './compte-component/compte-component.component';
import { EncadrantComponent } from './encadrant/encadrant.component'
import { AjouterProjetComponentComponent } from './ajouter-projet-component/ajouter-projet-component.component'
import { ProjetDetailComponent } from './projet-detail/projet-detail.component'
import { DiscussionComponent } from './discussion/discussion.component';
import { RegisterComponent } from './register/register.component';
import { EspaceStagiaireComponent } from './stagiaire/espace-stagiaire/espace-stagiaire.component';
import { EspaceAdminComponent } from './admin/espace-admin/espace-admin.component';
import { ProjetsStagiaireComponent } from './stagiaire/projet-stagiaire/projet-stagiaire.component';
import { ProjetDetailStagiaireComponent } from './stagiaire/projet-detail-stagiaire/projet-detail-stagiaire.component';
import { ProjetsAdminComponent } from './admin/projets-admin/projets-admin.component';
import { ProjetDetailAdminComponent } from './admin/projet-detail-admin/projet-detail-admin.component';
import { DashboardAdminComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { DashboardStagiaireComponent } from './stagiaire/dashboard-stagiaire/dashboard-stagiaire.component';
import { AcceuilAdminComponent } from './admin/acceuil-admin/acceuil-admin.component';
import { AccueilStagiaireComponent } from './stagiaire/accueil-stagiaire/accueil-stagiaire.component';


const routes: Routes = [
  { path: '', component: RegisterComponent },
  { path: 'login', component: RegisterComponent },
  { path: 'encadrant', component: EncadrantComponent, children: [
      { path: 'accueil', component: AccueilComponentComponent },
      { path: 'projets', component: ProjetsComponentComponent },
      { path: 'dashboard', component: DashboardComponentComponent },
      { path: 'settings', component: SettingsComponentComponent },
      { path: 'chat', component: DiscussionComponent },
      { path: 'monCompte', component: CompteComponentComponent },
      { path: 'addProject', component: AjouterProjetComponentComponent},
      { path: 'projets/:id', component: ProjetDetailComponent }

  ] },

  { path: 'stagiaire', component: EspaceStagiaireComponent, children: [
        { path: 'accueil', component: AccueilStagiaireComponent },
        { path: 'projets', component: ProjetsStagiaireComponent },
        { path: 'dashboard', component: DashboardStagiaireComponent },
        { path: 'settings', component: SettingsComponentComponent },
        { path: 'chat', component: DiscussionComponent },
        { path: 'monCompte', component: CompteComponentComponent },
        { path: 'addProject', component: AjouterProjetComponentComponent},
        { path: 'projets/:id', component: ProjetDetailStagiaireComponent }

    ] },
  { path: 'admin', component: EspaceAdminComponent, children: [
          { path: 'accueil', component: AcceuilAdminComponent },
          { path: 'projets', component: ProjetsAdminComponent  },
          { path: 'dashboard', component: DashboardAdminComponent },
          { path: 'settings', component: SettingsComponentComponent },
          { path: 'chat', component: DiscussionComponent },
          { path: 'monCompte', component: CompteComponentComponent },
          { path: 'addProject', component: AjouterProjetComponentComponent},
          { path: 'projets/:id', component: ProjetDetailAdminComponent }

      ] }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
