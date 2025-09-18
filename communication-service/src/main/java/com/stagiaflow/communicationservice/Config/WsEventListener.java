package com.stagiaflow.communicationservice.Config;

import com.stagiaflow.communicationservice.Controler.WsChatMessageType;
import com.stagiaflow.communicationservice.Model.Message;
import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.UserRepository;
import com.stagiaflow.communicationservice.Repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
@Component
@RequiredArgsConstructor
@Slf4j
public class WsEventListener {

    private final SimpMessageSendingOperations messageSendingOperations;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ConnectedUsersManager connectedUsersManager;  // Injecté

    @EventListener
    public void handleWsDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User disconnected: {}", username);

            // Mise à jour des utilisateurs connectés
            connectedUsersManager.userDisconnected(username);

            // Récupérer l'utilisateur
            User user = userRepository.findByEmail(username);

            if (user == null) {
                log.warn("Utilisateur non trouvé en base pour déconnexion : {}", username);
                return;
            }

            // Construire le message LEAVE
            Message message = Message.builder()
                    .type(WsChatMessageType.LEAVE)
                    .sender(user)
                    .timestamp(LocalDateTime.now())
                    .content("Utilisateur déconnecté")
                    .build();

            // Envoyer le message LEAVE à tous
            messageSendingOperations.convertAndSend("/topic/public", message);
        }
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String username = headerAccessor.getFirstNativeHeader("username");
        log.info("Nouvelle connexion WebSocket pour username: {}", username);

        if (username == null || !userRepository.existsByEmail(username)) {
            log.warn("Connexion refusée pour username: {}", username);
            throw new IllegalArgumentException("Utilisateur non autorisé");
        }

        headerAccessor.getSessionAttributes().put("username", username);

        // Mise à jour des utilisateurs connectés
        connectedUsersManager.userConnected(username);

        log.info("Connexion autorisée pour username: {}", username);
    }
}

