package com.stagiaflow.communicationservice.Service;


import com.stagiaflow.communicationservice.Controler.WsChatMessageType;
import com.stagiaflow.communicationservice.Model.Message;
import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.MessageRepository;
import com.stagiaflow.communicationservice.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MessageRepository messageRepository;

    public MessageService(UserRepository userRepository,MessageRepository messageRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.messageRepository=messageRepository;
    }
    public void handleMessage(Message message) {
        // Sauvegarde
        messageRepository.save(message);

        // Notification
        if (message.getType() == WsChatMessageType.PRIVATE_CHAT && message.getReceiver() != null) {
            // Notifier uniquement le destinataire
            notificationService.sendNotificationEmail(
                    message.getReceiver().getEmail(),
                    message.getSender().getEmail(),
                    message.getContent()
            );
        } else {
            // Message général → notifier tous sauf expéditeur
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers) {
                if (!user.getEmail().equalsIgnoreCase(message.getSender().getEmail())) {
                    notificationService.sendNotificationEmail(
                            user.getEmail(),
                            message.getSender().getEmail(),
                            message.getContent()
                    );
                }
            }
        }
    }

}
