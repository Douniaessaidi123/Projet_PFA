package com.stagiaflow.authservice.controller;

import com.stagiaflow.authservice.entity.User;
import com.stagiaflow.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")//	Autorise les requêtes CORS de n’importe quel domaine (utile pour Angular ou autre frontend).
public class AdminController {

    private final AuthService authService;

    @GetMapping("/stagiaires/en-attente")
    public List<User> getStagiairesEnAttente() {
        return new ArrayList<>(authService.getAllDemandes());
    }

    @GetMapping("/stagiaires/{id}/valider")
    public ResponseEntity<String> validerStagiaire(@PathVariable Long id) { // Spring récupère la valeur de {id} dans l’URL
        try {
            authService.validerUtilisateur(id);
            return ResponseEntity.ok("Stagiaire validé avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(" Erreur : " + e.getMessage());
        }
    }

    @GetMapping("/stagiaires/{id}/refuser")
    public ResponseEntity<String> refuserStagiaire(@PathVariable Long id) {
        try {
            authService.refuserUtilisateur(id);
            return ResponseEntity.ok("Stagiaire refusé.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(" Erreur : " + e.getMessage());
        }
    }

}
