package com.stagiaflow.projectservice.controller;

import com.stagiaflow.projectservice.entities.EtatTache;
import com.stagiaflow.projectservice.entities.Projet;
import com.stagiaflow.projectservice.entities.Role;
import com.stagiaflow.projectservice.entities.User;
import com.stagiaflow.projectservice.exceptions.ResourceNotFoundException;
import com.stagiaflow.projectservice.repository.ProjetRepository;
import com.stagiaflow.projectservice.services.ProjetService;
import com.stagiaflow.projectservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.stagiaflow.projectservice.dto.ProjetDTO;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/projets")
@CrossOrigin(origins = "*")
public class ProjetController {

    @Autowired
    private ProjetRepository projetRepository;
    @Autowired
    private ProjetService projetService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<Projet> createProjet(
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("dateDebut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam("dateFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam("encadrantId") Long encadrantId,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        String fileName = null;

        if (file != null && !file.isEmpty()) {
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName; // évite les doublons
            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);

            fileName = uniqueFileName;
        }


        Projet projet = projetService.createProjetAvecFichier(
                titre, description, dateDebut, dateFin, encadrantId, fileName
        );

        return ResponseEntity.ok(projet);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(projetService.getProjetDTOById(id));
    }

    // Projets d’un encadrant
    @GetMapping("/encadrant/{encadrantId}")
    public List<Projet> getProjetsByEncadrant(@PathVariable("encadrantId") Long encadrantId) {
        return projetService.getProjetsByEncadrant(encadrantId);
    }


    // Détail d’un projet
    /*@GetMapping("/{id}")
    public Projet getProjetById(@PathVariable("id") Long id) {
        return projetService.getProjetById(id);
    }*/


    @GetMapping("/stagiaires/by-email")
    public ResponseEntity<User> getStagiaireByEmail(@RequestParam("email") String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PutMapping("/{projetId}/assign-stagiaire-by-email")
    public ResponseEntity<Void> assignStagiaireByEmail(@PathVariable("projetId") Long projetId,
                                                       @RequestParam("email") String email) {
        projetService.assignStagiaireToProjetByEmail(projetId, email);
        return ResponseEntity.noContent().build();
    }

    // Récupérer tous les projets
    @GetMapping
    public List<Projet> getAllProjets() {
        return projetService.getAllProjets();
    }


    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable("fileName") String fileName) {
        try {
            System.out.println("Tentative de téléchargement du fichier : " + fileName);


            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(fileName).normalize();

            System.out.println("Chemin complet du fichier : " + filePath);

            if (!Files.exists(filePath)) {
                System.out.println("Fichier non trouvé !");
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            System.out.println("Lecture du fichier réussie, taille : " + fileContent.length + " bytes");

            String encodedFileName = java.net.URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + encodedFileName + "\"")
                    .body(fileContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ProjetController.java
    @GetMapping("/stagiaire/{stagiaireId}")
    public ResponseEntity<ProjetDTO> getProjetByStagiaire(@PathVariable("stagiaireId") Long stagiaireId) {
        try {
            return ResponseEntity.ok(projetService.getProjetByStagiaire(stagiaireId));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/encadrant/{id}/stats")
    public ResponseEntity<Map<String, Object>> getStatsParProjetPourEncadrant(@PathVariable("id") Long id) {
        return ResponseEntity.ok(projetService.getStatsParProjetPourEncadrant(id));
    }



    @GetMapping("/stats/global")
    public ResponseEntity<Map<String, Long>> getGlobalStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("projets", projetRepository.count());
        stats.put("encadrants", userRepository.countByRole(Role.ENCADRANT));
        stats.put("stagiaires", userRepository.countByRole(Role.STAGIAIRE));
        return ResponseEntity.ok(stats);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Projet> updateProjet(
            @PathVariable("id") Long id,
            @RequestParam(value = "titre", required = false) String titre,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "dateDebut", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(value = "dateFin", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        Projet updated = projetService.updateProjet(id, titre, description, dateDebut, dateFin, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{projetId}/stagiaires/{stagiaireId}")
    public ResponseEntity<Void> supprimerStagiaire(
            @PathVariable("projetId") Long projetId,
            @PathVariable("stagiaireId") Long stagiaireId) {

        projetService.removeStagiaireFromProjet(projetId, stagiaireId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/encadrant/{id}/last5")
    public List<Projet> getDerniersProjets(@PathVariable Long id) {
        return projetRepository.findTop5ByEncadrantIdOrderByCreatedAtDesc(id);
    }








}
