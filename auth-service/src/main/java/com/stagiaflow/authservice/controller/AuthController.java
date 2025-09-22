package com.stagiaflow.authservice.controller;

import com.stagiaflow.authservice.dto.LoginRequest;
import com.stagiaflow.authservice.dto.RegisterRequest;
import com.stagiaflow.authservice.entity.User;
import com.stagiaflow.authservice.entity.Role;
import com.stagiaflow.authservice.service.AuthService;
import com.stagiaflow.authservice.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // ✅ Autorise Angular
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User savedUser = authService.temporarySave(request);
        if (savedUser.getRole() == Role.STAGIAIRE || savedUser.getRole() == Role.ENCADRANT || savedUser.getRole() == Role.ADMIN) {
            return ResponseEntity.ok("Votre inscription est en attente de validation par l'administrateur.");
        }
        return ResponseEntity.badRequest().body("Seuls les stagiaires passent par validation admin.");
    }

    @PutMapping("/valider/{id}")
    public ResponseEntity<?> validerUtilisateur(@PathVariable Long id) {
        try {
            authService.validerUtilisateur(id);
            return ResponseEntity.ok("Utilisateur validé.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(user);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
