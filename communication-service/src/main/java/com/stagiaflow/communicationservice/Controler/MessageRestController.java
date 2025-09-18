package com.stagiaflow.communicationservice.Controler;

import com.stagiaflow.communicationservice.Model.Message;
import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.MessageRepository;
import com.stagiaflow.communicationservice.Repository.UserRepository;
import com.stagiaflow.communicationservice.Service.MessageService;
import com.stagiaflow.communicationservice.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:4200")
public class MessageRestController {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private MessageService messageservice;

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getMessageHistory() {
        // Récupérer tous les messages triés par timestamp
        List<Message> messages = messageRepository.findByReceiverIsNullAndRoomIdIsNullOrderByTimestampAsc();

        return ResponseEntity.ok(messages);
    }



    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody Message message) {
        Map<String, String> response = new HashMap<>();

        // Vérification de l'expéditeur
        if (message.getSenderEmail() == null) {
            response.put("status", "error");
            response.put("message", "L'email de l'expéditeur est manquant");
            return ResponseEntity.badRequest().body(response);
        }

        // Récupération expéditeur
        User sender = userRepository.findByEmail(message.getSenderEmail());
        if (sender == null) {
            response.put("status", "error");
            response.put("message", "Utilisateur expéditeur introuvable");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        message.setSender(sender);

        if (message.getType() == WsChatMessageType.PRIVATE_CHAT) {
            // Récupération destinataire
            if (message.getReceiverEmail() != null) {
                User receiver = userRepository.findByEmail(message.getReceiverEmail());
                if (receiver == null) {
                    response.put("status", "error");
                    response.put("message", "Utilisateur destinataire introuvable");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
                message.setReceiver(receiver);
            }
        } else if (message.getType() == WsChatMessageType.GROUP_CHAT) {
            // Vérifier que roomId est présent
            if (message.getRoomId() == null || message.getRoomId().isEmpty()) {
                response.put("status", "error");
                response.put("message", "roomId est requis pour un message de groupe");
                return ResponseEntity.badRequest().body(response);
            }
        }

        message.setTimestamp(LocalDateTime.now());

        // Sauvegarde + notifications
        messageservice.handleMessage(message);

        response.put("status", "ok");
        response.put("message", "Message traité et notifications envoyées");
        return ResponseEntity.ok(response);
    }
    @GetMapping("/private")
    public ResponseEntity<List<Message>> getPrivateMessages(
            @RequestParam("senderEmail") String senderEmail,
            @RequestParam("receiverEmail") String receiverEmail) {

        System.out.println("📩 Requête GET /api/messages/private");
        System.out.println("   Sender email reçu   : " + senderEmail);
        System.out.println("   Receiver email reçu : " + receiverEmail);

        // Vérification email identique
        if (senderEmail.equalsIgnoreCase(receiverEmail)) {
            System.out.println("⚠️ Tentative de discussion avec soi-même");
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Récupération sender
        User sender = userRepository.findByEmailIgnoreCase(senderEmail);
        if (sender == null) {
            System.err.println("❌ Sender introuvable en DB : " + senderEmail);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender introuvable");
        }

        // Récupération receiver
        User receiver = userRepository.findByEmailIgnoreCase(receiverEmail);
        if (receiver == null) {
            System.err.println("❌ Receiver introuvable en DB : " + receiverEmail);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver introuvable");
        }

        // Récupération des messages
        System.out.println("✅ Les deux utilisateurs existent, récupération des messages...");
        List<Message> messages = messageRepository.findPrivateMessages(sender.getId(), receiver.getId());

        System.out.println("📦 Nombre de messages trouvés : " + messages.size());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/history/group")
    public ResponseEntity<List<Message>> getGroupMessageHistory(@RequestParam("roomId") String roomId) {
        List<Message> messages = messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return ResponseEntity.ok(messages);
    }


}

