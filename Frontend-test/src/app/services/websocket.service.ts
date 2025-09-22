import { Injectable, OnDestroy } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messageSubject.asObservable();

  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();

  private currentGroupSubscription: any = null;
  private currentRoomId: string | null = null;

  constructor(private messageService: MessageService) {}

  connect(userEmail: string) {
    const socket = new SockJS('http://localhost:8081/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str: string) => console.log('[WS DEBUG]', str),
      connectHeaders: {
        username: userEmail.toLowerCase()
      }
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Connecté au serveur WebSocket');
      this.connectionSubject.next(true);

      // 📩 Message public
      this.stompClient?.subscribe('/topic/public', (message: any) => {
        const msg = JSON.parse(message.body);
        console.log('🌍 Message public reçu :', msg);
        this.messageSubject.next(msg);
      });

      // 📩 Message privé
      this.stompClient?.subscribe('/user/queue/messages', (message: any) => {
        const msg = JSON.parse(message.body);
        console.log('📩 Message privé reçu :', msg);
        this.messageSubject.next(msg);
      });

      // 📩 Liste des utilisateurs connectés
      this.stompClient?.subscribe('/topic/connectedUsers', (message: any) => {
        const rawUsers = JSON.parse(message.body);
        const users = Array.isArray(rawUsers) ? rawUsers : [];
        console.log('👥 Liste broadcast users :', users);
        this.messageSubject.next({ type: 'CONNECTED_USERS_LIST', users });
      });

      // 👥 Rejoindre automatiquement la salle de groupe si active
      if (this.currentRoomId) {
        this.subscribeGroupRoom(this.currentRoomId);
      }

      // 🟢 Annonce "JOIN"
      this.stompClient?.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({ senderEmail: userEmail, type: 'JOIN' })
      });
    };

    this.stompClient.onStompError = (frame: any) => {
      console.error('❌ Erreur STOMP :', frame.headers['message']);
      console.error('ℹ️ Détails :', frame.body);
    };

    this.stompClient.activate();
  }

  // 👥 Abonnement à une room de groupe spécifique
  subscribeGroupRoom(roomId: string): void {
    if (!this.stompClient) {
      console.error("❌ stompClient non initialisé");
      return;
    }

    const topic = `/topic/group-${roomId}`;

    // 🔄 Désabonnement de la room précédente
    if (this.currentGroupSubscription) {
      this.currentGroupSubscription.unsubscribe();
      this.currentGroupSubscription = null;
    }

    this.currentRoomId = roomId;

    // ✅ Abonnement à la nouvelle room
    this.currentGroupSubscription = this.stompClient.subscribe(topic, (message: any) => {
      const msg = JSON.parse(message.body);
      console.log(`👥 Message groupe ${roomId} reçu :`, msg);
      this.messageSubject.next(msg);
    });

    console.log(`🔔 Abonné au groupe: ${topic}`);
  }

  // 🌍 Message public
  sendMessage(senderEmail: string, content: string, type: 'CHAT' | 'JOIN' | 'LEAVE') {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket is not connected. Unable to send message.');
      return;
    }

    const chatMessage = { senderEmail, content, type };

    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });

    this.messageService.sendMessageToBackend(senderEmail, content, type).subscribe({
      next: () => console.log('✅ Message sauvegardé & notification envoyée'),
      error: (err: any) => console.error('❌ Erreur lors de l’envoi HTTP :', err)
    });
  }

  // 🔒 Message privé
  sendPrivateMessage(senderEmail: string, receiverEmail: string, content: string) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket is not connected. Unable to send private message.');
      return;
    }

    const chatMessage = {
      senderEmail,
      receiverEmail,
      content,
      type: 'PRIVATE_CHAT'
    };

    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });

    this.messageService.sendMessageToBackend(senderEmail, content, 'PRIVATE_CHAT', receiverEmail)
      .subscribe({
        next: () => console.log('✅ Message privé sauvegardé & notification envoyée'),
        error: (err) => console.error('❌ Erreur HTTP :', err)
      });
  }

  // 👥 Message de groupe
  sendGroupMessage(senderEmail: string, content: string, roomId: string) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket is not connected. Unable to send group message.');
      return;
    }

    const chatMessage = {
      senderEmail,
      content,
      type: 'GROUP_CHAT',
      roomId
    };

    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage)
    });

  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionSubject.next(false);
      console.log('❌ Déconnecté du serveur WebSocket');
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}

