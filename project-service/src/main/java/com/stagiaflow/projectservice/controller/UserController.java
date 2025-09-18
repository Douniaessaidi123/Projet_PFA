package com.stagiaflow.projectservice.controller;

import com.stagiaflow.projectservice.dto.UserProfileDTO;
import com.stagiaflow.projectservice.entities.LoginRequest;
import com.stagiaflow.projectservice.entities.Projet;
import com.stagiaflow.projectservice.entities.Role;
import com.stagiaflow.projectservice.entities.User;
import com.stagiaflow.projectservice.exceptions.ResourceNotFoundException;
import com.stagiaflow.projectservice.repository.ProjetRepository;
import com.stagiaflow.projectservice.repository.UserRepository;
import com.stagiaflow.projectservice.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private ProjetRepository projetRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    // Tous les stagiaires
    @GetMapping("/stagiaires")
    public List<User> getAllStagiaires() {
        return userService.getAllStagiaires();
    }

    // Tous les encadrants
    @GetMapping("/encadrants")
    public List<User> getAllEncadrants() {
        return userService.getAllEncadrants();
    }

    // Rechercher utilisateur (par nom ou email)
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam(name = "keyword") String keyword) {
        return userService.searchUsers(keyword);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail());

        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Identifiants incorrects");
        }

        // Cache le mot de passe avant de renvoyer l'objet
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        return userService.findById(id)
                .map(u -> {
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }



    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable("id") Long id,
                                              @RequestBody UserProfileDTO dto) {
        User u = userService.updateProfile(id, dto);
        u.setPassword(null);
        return ResponseEntity.ok(u);
    }

    @PutMapping(
            value = "/{id}/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier requis"));
        }
        Map<String, String> out = userService.updatePhoto(id, file);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/photos/{fileName:.+}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable("fileName") String fileName) {
        try {
            Path base = Paths.get("uploads/avatars").toAbsolutePath().normalize();
            Path p = base.resolve(fileName).normalize();

            if (!p.startsWith(base) || !Files.exists(p)) {
                return ResponseEntity.notFound().build();
            }

            byte[] bytes = Files.readAllBytes(p);
            String contentType = Files.probeContentType(p);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable("role") Role role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    @GetMapping("/{id}/projets-encadres")
    public ResponseEntity<List<Projet>> getProjetsEncadres(@PathVariable("id") Long id) {
        User encadrant = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(encadrant.getProjetsEncadres());
    }

    @GetMapping("/{id}/projet-stagiaire")
    public ResponseEntity<Projet> getProjetStagiaire(@PathVariable("id") Long id) {
        User stagiaire = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(stagiaire.getProjet());
    }
}

