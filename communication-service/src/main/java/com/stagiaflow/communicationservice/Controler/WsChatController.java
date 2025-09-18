package com.stagiaflow.communicationservice.Controler;

import com.stagiaflow.communicationservice.Config.ConnectedUsersListMessage;
import com.stagiaflow.communicationservice.Config.ConnectedUsersManager;
import com.stagiaflow.communicationservice.Model.Message;
import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.MessageRepository;
import com.stagiaflow.communicationservice.Repository.UserRepository;
import org.jboss.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;

@Controller
@CrossOrigin(origins = "http://localhost:4200")
public class WsChatController {

    private static final Logger log = Logger.getLogger(WsChatController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectedUsersManager connectedUsersManager;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 🟢 Envoi d'un message (public, privé ou groupe)
    @MessageMapping("chat.sendMessage")
    public void sendMessage(@Payload Message msg) {
        log.info("📩 Nouveau message reçu via WebSocket : " + msg);

        // Vérification de l'expéditeur
        if (msg.getSenderEmail() == null || msg.getSenderEmail().isEmpty()) {
            log.error("❌ [sendMessage] Sender email manquant");
            return;
        }

        User sender = userRepository.findByEmailIgnoreCase(msg.getSenderEmail());
        if (sender == null) {
            log.error("❌ [sendMessage] Sender introuvable : " + msg.getSenderEmail());
            return;
        }
        msg.setSender(sender);
        msg.setTimestamp(LocalDateTime.now());

        // 🔒 Message privé
        if (msg.getType() == WsChatMessageType.PRIVATE_CHAT) {
            log.info("➡️ Message privé de " + msg.getSenderEmail() + " → " + msg.getReceiverEmail());

            if (msg.getReceiverEmail() == null || msg.getReceiverEmail().isEmpty()) {
                log.error("❌ [sendMessage] Receiver email manquant pour message privé");
                return;
            }

            User receiver = userRepository.findByEmailIgnoreCase(msg.getReceiverEmail());
            if (receiver == null) {
                log.error("❌ [sendMessage] Receiver introuvable : " + msg.getReceiverEmail());
                return;
            }

            msg.setReceiver(receiver);

            // ✅ Sauvegarde message privé

            log.info("💾 Message privé sauvegardé (ID: " + msg.getId() + ")");

            // ✅ Envoi au sender et receiver
            messagingTemplate.convertAndSendToUser(receiver.getEmail().toLowerCase(), "/queue/messages", msg);
            messagingTemplate.convertAndSendToUser(sender.getEmail().toLowerCase(), "/queue/messages", msg);
            log.info("📤 Message privé envoyé à " + sender.getEmail() + " et " + receiver.getEmail());

            // 👥 Message de groupe
        } else if (msg.getType() == WsChatMessageType.GROUP_CHAT) {
            if (msg.getRoomId() == null || msg.getRoomId().isEmpty()) {
                log.error("❌ [sendMessage] roomId manquant pour message de groupe");
                return;
            }

            // ✅ Sauvegarde message groupe

            log.info("💾 Message de groupe sauvegardé (ID: " + msg.getId() + ")");

            String roomTopic = "/topic/group-" + msg.getRoomId();
            messagingTemplate.convertAndSend(roomTopic, msg);
            log.info("📤 Message groupe envoyé à " + roomTopic);

            // 🌍 Message public (optionnel)
        } else {
            log.info("🌍 Message public reçu de " + msg.getSenderEmail());
            // ✅ Sauvegarde si tu veux

            log.info("💾 Message public sauvegardé (ID: " + msg.getId() + ")");

            messagingTemplate.convertAndSend("/topic/public", msg);
            log.info("📤 Message public envoyé à /topic/public");
        }
    }

    // 🔵 Ajout d'un utilisateur (JOIN)
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload Message message,
                        SimpMessageHeaderAccessor headerAccessor) {
        String username = message.getSenderEmail();

        if (username != null && !username.isEmpty()) {
            User user = userRepository.findByEmailIgnoreCase(username);
            if (user != null) {
                message.setSender(user);
                message.setType(WsChatMessageType.JOIN);
                message.setContent(user.getFirstName() + " " + user.getLastName() + " a rejoint le chat");
                message.setTimestamp(LocalDateTime.now());

                headerAccessor.getSessionAttributes().put("username", username);
                connectedUsersManager.userConnected(username);

                messagingTemplate.convertAndSendToUser(
                        username.toLowerCase(),
                        "/queue/connectedUsers",
                        new ConnectedUsersListMessage(connectedUsersManager.getConnectedUsers())
                );

                messagingTemplate.convertAndSend("/topic/public", message);
            }
        }
    }

}


