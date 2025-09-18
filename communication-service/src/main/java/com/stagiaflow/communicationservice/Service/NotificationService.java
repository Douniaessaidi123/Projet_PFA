package com.stagiaflow.communicationservice.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotificationEmail(String to, String from, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Nouveau message de " + from);

        // Inclure l'expéditeur dans le texte du message
        String text = "Bonjour,\n\n"
                + "Vous avez reçu un nouveau message de " + from + " :\n\n"
                + "\"" + content + "\"\n\n"
                + "Veuillez vous connecter à la plateforme pour voir les détails.\n\n"
                + "Cordialement,\n"
                + "L'équipe StagiaFlow";

        message.setText(text);

        mailSender.send(message);
    }

}

