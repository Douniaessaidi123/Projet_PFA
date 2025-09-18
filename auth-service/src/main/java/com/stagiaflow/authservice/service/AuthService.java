package com.stagiaflow.authservice.service;

import com.stagiaflow.authservice.dto.RegisterRequest;
import com.stagiaflow.authservice.entity.Role;
import com.stagiaflow.authservice.entity.User;
import com.stagiaflow.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Liste temporaire en mémoire pour stocker les stagiaires en attente
    private final Map<Long, User> demandesEnAttente = new HashMap<>();
    private long idSequence = 1;

    /** Enregistre temporairement un stagiaire en attente de validation */
    public User temporarySave(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email déjà utilisé !");
        }

        User user = new User();
        user.setLastName(request.getLastName());
        user.setFirstName(request.getFirstName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(Role.valueOf(request.getRole()));
        user.setValide(false);

        long tempId = idSequence++;
        user.setId(tempId);
        demandesEnAttente.put(tempId, user);

        emailService.sendValidationEmailToAdmin(user);
        return user;
    }

    /** Valide un utilisateur stagiaire et l'enregistre définitivement */
    public void validerUtilisateur(Long utilisateurId) {
        User user = demandesEnAttente.get(utilisateurId);
        if (user == null) throw new IllegalStateException("Demande non trouvée.");

        user.setValide(true);
        userRepository.save(user); // Sauvegarde en base
        demandesEnAttente.remove(utilisateurId);

        emailService.sendConfirmationToStagiaire(user.getEmail(), true);
    }

    /** Refuse un stagiaire et supprime sa demande */
    public void refuserUtilisateur(Long utilisateurId) {
        User user = demandesEnAttente.remove(utilisateurId);
        if (user == null) throw new IllegalStateException("Demande non trouvée ou déjà traitée.");

        emailService.sendConfirmationToStagiaire(user.getEmail(), false);
    }

    /** Connexion utilisateur classique */
    public User login(String email, String motDePasse) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé"));

        if (!user.isValide() && user.getRole() == Role.STAGIAIRE) {
            throw new IllegalStateException("Votre compte stagiaire est en attente de validation.");
        }

        if (!user.getPassword().equals(motDePasse)) {
            throw new IllegalStateException("Mot de passe incorrect.");
        }

        user.setPassword(null); // cache le mot de passe avant de renvoyer
        return user;
    }

    // Méthodes utilitaires pour l'admin
    public User getDemandeTemporaire(Long id) {
        return demandesEnAttente.get(id);
    }

    public Collection<User> getAllDemandes() {
        return demandesEnAttente.values();
    }
}
