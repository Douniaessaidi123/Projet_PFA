package com.stagiaflow.communicationservice.Controler;

import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")// Pour permettre les appels depuis le frontend
public class UserControler {

    @Autowired
    private UserRepository userRepository;

    // 🔹 Obtenir tous les utilisateurs
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Obtenir un utilisateur par ID
    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id);
    }
    // 🔹 Ajouter un nouvel utilisateur
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }



    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> checkUser(@PathVariable("email") String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email);

        if (user != null) {
            // Vérifie mot de passe en clair (à adapter pour hash)
            if (user.getPassword().equals(loginRequest.password)) {
                // Supprime le mot de passe du user avant de retourner (optionnel)
                user.setPassword(null);
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect");
    }



    // DTO pour la requête login (email + password)
    public static class LoginRequest {
        public String email;
        public String password;

        // getters/setters si besoin
    }

}