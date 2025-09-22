package com.stagiaflow.communicationservice.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ConnectedUsersManager {

    private final Set<String> connectedUsers = ConcurrentHashMap.newKeySet();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void userConnected(String email) {
        connectedUsers.add(email.toLowerCase());

        // Broadcast de la liste à tous les abonnés
        messagingTemplate.convertAndSend("/topic/connectedUsers", connectedUsers);

        // Envoi de la liste complète uniquement au nouvel utilisateur
        messagingTemplate.convertAndSendToUser(
                email.toLowerCase(),
                "/queue/connectedUsers",
                connectedUsers
        );
    }

    public void userDisconnected(String email) {
        connectedUsers.remove(email.toLowerCase());
        messagingTemplate.convertAndSend("/topic/connectedUsers", connectedUsers);
    }

    // Getter pour récupérer la liste des utilisateurs connectés
    public Set<String> getConnectedUsers() {
        return connectedUsers;
    }
}
