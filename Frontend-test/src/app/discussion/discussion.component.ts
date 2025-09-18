import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { MessageService, ChatMessage } from '../services/message.service';
import { AuthService, User } from '../services/auth.service';
import { WebsocketService } from '../services/websocket.service';
import { TeamService, Team, Projet } from '../services/team.service';

import { MatDialog } from '@angular/material/dialog';
import { GroupService, Group } from '../services/group.service';
import { CreateChannelDialogComponent } from './create-channel-dialog/create-channel-dialog.component';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit, OnDestroy {
  contacts: User[] = [];

  teams: Team[] = [];
  projectsWithoutChannel: Projet[] = [];
  activeContact: User | null = null;
  activeGroup: Team | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  searchTerm: string = '';
  currentUser: User | null = null;
  connectedUsersEmails: Set<string> = new Set();


  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
    private websocketService: WebsocketService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private groupService: GroupService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
console.log("🟢 Initialisation du composant Discussion...");

// 📌 Récupération de l'utilisateur connecté
this.currentUser = this.authService.getUser();
if (this.currentUser && this.currentUser.email) {
  console.log(`👤 Utilisateur connecté : ${this.currentUser.email}`);
  this.websocketService.connect(this.currentUser.email);
} else {
  console.warn('⚠ Aucun utilisateur connecté, WebSocket non connecté.');
}

// 📌 Chargement des contacts
this.userService.getAllUsers().subscribe(users => {
  console.log("📇 Liste des contacts reçue :", users);
  this.contacts = users;
  this.cdRef.detectChanges();
});

// 📌 Chargement de l’historique global (discussion publique par défaut)
this.loadMessages();


// 📌 Récupération des équipes / projets si encadrant ou stagiaire
if (this.currentUser && this.currentUser.id !== undefined && this.currentUser.role) {
  if (this.currentUser.role === 'ENCADRANT') {
    this.teamService.getTeams(this.currentUser.id).subscribe(teams => {
      this.teams = teams;
            // ✅ On charge aussi les projets sans channel
            this.loadProjectsWithoutChannel();
    });
  } else if (this.currentUser.role === 'STAGIAIRE') {
    this.teamService.getTeamsForStagiaire(this.currentUser.id).subscribe(teams => {
      this.teams = teams;
    });
  }
} else {
  console.warn('⚠ Utilisateur non connecté ou informations manquantes pour récupérer les équipes.');
}


    // 📌 Écoute des messages en temps réel
    this.websocketService.messages$.subscribe(rawMessage => {
      if (!rawMessage) return;
      console.log('📩 Message WebSocket reçu :', rawMessage);

      switch (rawMessage.type) {
        case 'CONNECTED_USERS_LIST':
          if (rawMessage.users) {
            console.log("👥 Liste des utilisateurs connectés :", rawMessage.users);
            this.connectedUsersEmails = new Set(
              rawMessage.users.map((email: string) => email.toLowerCase())
            );
          }
          break;

        case 'JOIN':
          if (rawMessage.sender?.email) {
            console.log(`➕ ${rawMessage.sender.email} a rejoint`);
            this.connectedUsersEmails.add(rawMessage.sender.email.toLowerCase());
            this.messages.push({
              content: `${this.getUserFullName(rawMessage.sender)} a rejoint la discussion`,
              sender: this.systemUser(),
              timestamp: rawMessage.timestamp || new Date().toISOString(),
              type: 'JOIN'
            });
          }
          break;

        case 'LEAVE':
          if (rawMessage.sender?.email) {
            console.log(`➖ ${rawMessage.sender.email} a quitté`);
            this.connectedUsersEmails.delete(rawMessage.sender.email.toLowerCase());
            this.messages.push({
              content: `${this.getUserFullName(rawMessage.sender)} a quitté la discussion`,
              sender: this.systemUser(),
              timestamp: rawMessage.timestamp || new Date().toISOString(),
              type: 'LEAVE'
            });
          }
          break;

        case 'CHAT':
          console.log(`💬 Message public de ${rawMessage.sender?.email} : ${rawMessage.content}`);
          this.messages.push(this.formatChatMessage(rawMessage));
          break;

        case 'PRIVATE_CHAT':
          console.log(
            `🔒 Message privé reçu de ${rawMessage.sender?.email} → ${rawMessage.receiver?.email}`
          );

          const currentEmail = this.currentUser?.email?.toLowerCase();
          const activeEmail = this.activeContact?.email?.toLowerCase();
          const senderEmail = rawMessage.sender?.email?.toLowerCase();
          const receiverEmail = rawMessage.receiver?.email?.toLowerCase();

          console.log("📌 DEBUG PRIVATE", { currentEmail, activeEmail, senderEmail, receiverEmail });

          // ✅ Vérifie si le message concerne l’utilisateur courant
          if (senderEmail === currentEmail || receiverEmail === currentEmail) {
            const chatMsg = this.formatChatMessage(rawMessage, true);

            // ✅ Si la discussion active correspond → on affiche directement
            if (
              (senderEmail === currentEmail && receiverEmail === activeEmail) ||
              (senderEmail === activeEmail && receiverEmail === currentEmail)
            ) {
              this.messages.push(chatMsg);
              this.cdRef.detectChanges();
            }
          }
          break;
       case 'GROUP_CHAT':
         const roomId = rawMessage.roomId;
         const activeRoomId = this.activeGroup?.projetId?.toString();

         console.log("📩 [GROUP_CHAT] Message reçu pour roomId =", roomId);
         console.log("📌 [GROUP_CHAT] Groupe actif :", activeRoomId);

         if (roomId === activeRoomId) {
           console.log("✅ [GROUP_CHAT] Le message correspond au groupe actif, ajout à l'interface");
           const groupMsg = this.formatChatMessage(rawMessage);
           this.messages.push(groupMsg);
           this.cdRef.detectChanges();
         } else {
           console.warn("⚠️ [GROUP_CHAT] Message ignoré : roomId ne correspond pas");
         }
         break;

        default:
          console.warn("⚠ Type de message non géré :", rawMessage.type);
      }

      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    console.log("🛑 Déconnexion du WebSocket...");
    this.websocketService.disconnect();
  }

  // 📌 Récupère tout l'historique (public ou privé selon le cas)
  loadMessages() {
    if (this.activeContact && this.currentUser?.email) {
      // 🔒 Discussion privée
      this.messageService
        .getPrivateHistory(this.currentUser.email, this.activeContact.email)
        .subscribe((msgs: ChatMessage[]) => {
          this.messages = msgs;
          this.cdRef.detectChanges();
        });
    } else if (this.activeGroup) {
      // 👥 Discussion de groupe
      const roomId = this.activeGroup.projetId.toString();
      this.messageService
        .getGroupMessages(roomId)
        .subscribe((msgs: ChatMessage[]) => {
          this.messages = msgs;
          this.cdRef.detectChanges();
        });
    } else {
      // 🌍 Discussion publique
      this.messageService
        .getMessageHistory()
        .subscribe((msgs: ChatMessage[]) => {
          this.messages = msgs;
          this.cdRef.detectChanges();
        });
    }
  }


sendMessage(): void {
  const trimmedContent = this.newMessage.trim();
  if (!trimmedContent || !this.currentUser) return;

  const now = new Date().toISOString();

  if (this.activeContact) {
    // 🔒 Mode privé
    this.websocketService.sendPrivateMessage(
      this.currentUser.email,
      this.activeContact.email,
      trimmedContent
    );

    // ❌ On retire ce push direct pour éviter doublon
    // this.messages.push({
    //   content: trimmedContent,
    //   sender: this.currentUser!,
    //   receiver: this.activeContact,
    //   timestamp: now,
    //   type: 'PRIVATE_CHAT'
    // });

  } else if (this.activeGroup) {
    // 👥 Mode groupe
    const roomId = this.activeGroup.projetId.toString();

    // Envoi WS
    this.websocketService.sendGroupMessage(
      this.currentUser.email,
      trimmedContent,
      roomId
    );

    // Envoi HTTP (optionnel)
    this.messageService.sendMessageToBackend(
      this.currentUser.email,
      trimmedContent,
      'GROUP_CHAT',
      undefined,
      roomId
    ).subscribe(() => {
      console.log('Message groupe sauvegardé en base');
    }, err => {
      console.error('Erreur sauvegarde message groupe:', err);
    });

    // Optionnel : tu peux garder ce push pour afficher plus vite, mais attention doublons !
    // Je te conseille de le retirer aussi :
    // this.messages.push({
    //   content: trimmedContent,
    //   sender: this.currentUser!,
    //   timestamp: now,
    //   type: 'GROUP_CHAT',
    //   roomId: roomId
    // });

  } else {
    // 🌍 Mode public
    this.websocketService.sendMessage(
      this.currentUser.email,
      trimmedContent,
      'CHAT'
    );

    // ❌ On retire aussi ce push direct
    // this.messages.push({
    //   content: trimmedContent,
    //   sender: this.currentUser!,
    //   timestamp: now,
    //   type: 'CHAT'
    // });
  }

  this.newMessage = '';
  this.cdRef.detectChanges();
}


  // 📌 Ouvre un chat privé et charge son historique
  openPrivateChat(contact: User): void {
    this.activeContact = contact;
    console.log(`📂 Ouverture chat privé avec ${contact.email}`);

    if (this.currentUser?.email && contact.email) {
      this.messageService.getPrivateHistory(this.currentUser.email, contact.email)
        .subscribe(history => {
          console.log(`📂 Historique privé avec ${contact.email} :`, history);
          this.messages = history;
          this.cdRef.detectChanges();
        });
    }
  }

  // 📌 Filtre les contacts
  get filteredContacts(): User[] {
    if (!this.searchTerm) return this.contacts;
    const term = this.searchTerm.toLowerCase();
    return this.contacts.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }

  // 📌 URL avatar
  getAvatarUrl(email: string): string {
    return email
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`
      : 'assets/avatars/unknown.png';
  }

  // 📌 Utilisateur "Système"
  private systemUser(): User {
    return {
      firstName: 'Système',
      lastName: '',
      email: '',
      role: 'USER',
      departement: ''
    };
  }

  // 📌 Nom complet
  private getUserFullName(user: Partial<User>): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur inconnu';
  }

  // 📌 Formate un message reçu
  private formatChatMessage(rawMessage: any, isPrivate: boolean = false): ChatMessage {
    const senderEmail = rawMessage.sender?.email || '';
    const senderUser = this.contacts.find(u => u.email.toLowerCase() === senderEmail.toLowerCase()) || rawMessage.sender;

    return {
      content: rawMessage.content,
      sender: senderUser,
      receiver: isPrivate ? rawMessage.receiver : undefined,
      timestamp: rawMessage.timestamp || new Date().toISOString(),
      type: rawMessage.type,
      roomId: rawMessage.roomId // ✅ essentiel pour le groupe
    };
  }

  // 📌 Gestion des Teams
  loadTeams() {
    this.teamService.getTeams(this.currentUser!.id!).subscribe(
      (data) => this.teams = data
    );
  }

  loadProjectsWithoutChannel() {
    this.teamService.getProjectsWithoutChannel(this.currentUser!.id!).subscribe(
      (data) => this.projectsWithoutChannel = data
    );
  }

  onCreateChannel(projetId: number) {
    this.teamService.createChannel(projetId).subscribe(
      (newTeam) => {
        this.teams.push(newTeam);
        this.projectsWithoutChannel = this.projectsWithoutChannel.filter(p => p.id !== projetId);
      }
    );
  }

openCreateChanelDialog(): void {
  console.log('projectsWithoutChannel:', this.projectsWithoutChannel);

  if (this.projectsWithoutChannel.length === 0) {
    return;
  }

  const dialogRef = this.dialog.open(CreateChannelDialogComponent, {
    width: '400px',
    data: { projets: this.projectsWithoutChannel }
  });

  dialogRef.afterClosed().subscribe((projetId: number) => {
    if (projetId) {
      this.onCreateChannel(projetId);
    }
  });
}

openGroupChat(team: Team): void {
  this.activeGroup = team;
  this.activeContact = null;
  this.messages = [];

  const roomId = team.projetId.toString();
  console.log("📂 Ouverture discussion de groupe pour projet ID :", roomId);

  // Abonnement WebSocket au groupe
  this.websocketService.subscribeGroupRoom(roomId);

  // Chargement des messages historiques du groupe
  this.messageService.getGroupMessages(roomId).subscribe(
    messages => {
      console.log("📜 Historique des messages de groupe :", messages);
      this.messages = messages;
      this.cdRef.detectChanges();
    },
    err => {
      console.error("❌ Erreur lors de la récupération des messages de groupe :", err);
    }
  );
}



}

