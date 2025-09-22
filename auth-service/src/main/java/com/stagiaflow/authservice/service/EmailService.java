package com.stagiaflow.authservice.service;

import com.stagiaflow.authservice.entity.User;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Méthode simple pour envoyer un email texte
    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("essaididounia4@gmail.com"); // Remplace par ta config mail si besoin
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    // Méthode pour envoyer un email HTML à l'admin avec les boutons valider/refuser
    public void sendValidationEmailToAdmin(User stagiaire) {
        String to = "essaididounia4@gmail.com"; // Email de l'admin
        String subject = "Nouvelle demande d'inscription d'un stagiaire";

        // Base URL à adapter selon ton backend (ex: localhost ou domaine)
        String baseUrl = "http://localhost:8080/api/admin";

        // URLs pour valider ou refuser le stagiaire (GET avec param id)
        String validateUrl = "http://localhost:8080/api/admin/stagiaires/" + stagiaire.getId() + "/valider";
        String refuseUrl = "http://localhost:8080/api/admin/stagiaires/" + stagiaire.getId() + "/refuser";


        // Contenu HTML avec boutons
        String content = "<h3>Nouvelle demande d'inscription</h3>"
                + "<p><strong>Nom :</strong> " + stagiaire.getLastName() + "</p>"
                + "<p><strong>Prénom :</strong> " + stagiaire.getFirstName() + "</p>"
                + "<p><strong>Email :</strong> " + stagiaire.getEmail() + "</p>"
                + "<br/>"
                + "<a href=\"" + validateUrl + "\" style=\"padding: 10px 20px; background-color: green; color: white; text-decoration: none;\">Valider</a>&nbsp;"
                + "<a href=\"" + refuseUrl + "\" style=\"padding: 10px 20px; background-color: red; color: white; text-decoration: none;\">Refuser</a>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("essaididounia4@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true = contenu HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'envoi du mail HTML à l'admin");
        }
    }

    // Email de confirmation à envoyer au stagiaire après validation/refus
    public void sendConfirmationToStagiaire(String email, boolean accepted) {
        String subject = accepted ? "Inscription validée" : "Inscription refusée";
        String body = accepted ?
                "Félicitations ! Votre inscription a été validée. Vous pouvez maintenant vous connecter à StagiaFlow." :
                "Nous sommes désolés, votre inscription a été refusée.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("essaididounia4@gmail.com");
        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
