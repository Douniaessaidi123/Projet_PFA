package com.stagiaflow.projectservice.services;

import com.stagiaflow.projectservice.dto.ProjetDTO;
import com.stagiaflow.projectservice.dto.StagiaireDTO;
import com.stagiaflow.projectservice.dto.TacheDTO;
import com.stagiaflow.projectservice.entities.EtatTache;
import com.stagiaflow.projectservice.entities.Projet;
import com.stagiaflow.projectservice.entities.Tache;
import com.stagiaflow.projectservice.entities.User;
import com.stagiaflow.projectservice.exceptions.ResourceNotFoundException;
import com.stagiaflow.projectservice.repository.ProjetRepository;
import com.stagiaflow.projectservice.repository.TacheRepository;
import com.stagiaflow.projectservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TacheRepository tacheRepository;

    // Créer un projet avec un stagiaire affecté
    public Projet createProjet(Projet projet, Long stagiaireId) {
        if (projet.getEncadrant() != null && projet.getEncadrant().getId() != null) {
            User encadrant = userRepository.findById(projet.getEncadrant().getId()).orElse(null);
            if (encadrant != null) {
                projet.setEncadrant(encadrant);
            }
        }
        Projet savedProjet = projetRepository.save(projet);

        if (stagiaireId != null) {
            User stagiaire = userRepository.findById(stagiaireId).orElse(null);
            if (stagiaire != null) {
                stagiaire.setProjet(savedProjet);
                userRepository.save(stagiaire);
            }
        }

        return savedProjet;
    }


    // Liste des projets d’un encadrant
    public List<Projet> getProjetsByEncadrant(Long encadrantId) {
        return projetRepository.findByEncadrantId(encadrantId);
    }

    public ProjetDTO getProjetDTOById(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        return new ProjetDTO(
                projet.getId(),
                projet.getTitre(),
                projet.getDescription(),
                projet.getDateDebut(),
                projet.getDateFin(),
                projet.getFile(),
                projet.getEncadrant() != null
                        ? projet.getEncadrant().getFirstName() + " " + projet.getEncadrant().getLastName()
                        : null,
                projet.getStagiaires() != null
                        ? projet.getStagiaires().stream()
                        .map(s -> new StagiaireDTO(s.getId(), s.getFirstName(), s.getLastName(), s.getEmail()))
                        .collect(Collectors.toList())
                        : List.of()
        );
    }

    // Détails d’un projet
    public Projet getProjetById(Long projetId) {
        return projetRepository.findById(projetId).orElse(null);
    }

    @Transactional
    public void assignStagiaireToProjetByEmail(Long projetId, String email) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet non trouvé (id=" + projetId + ")"));

        User stagiaire = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Stagiaire non trouvé avec l'email: " + email));

        stagiaire.setProjet(projet);
        userRepository.save(stagiaire);
    }

    public Projet createProjetAvecFichier(String titre, String description, LocalDate dateDebut, LocalDate dateFin, Long encadrantId, String fileName) {
        User encadrant = userRepository.findById(encadrantId)
                .orElseThrow(() -> new RuntimeException("Encadrant non trouvé"));

        Projet projet = Projet.builder()
                .titre(titre)
                .description(description)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .file(fileName)
                .encadrant(encadrant)
                .build();

        return projetRepository.save(projet);
    }

    public List<Projet> getAllProjets() {
        return projetRepository.findAll();
    }

    // ProjetService.java
    public ProjetDTO getProjetByStagiaire(Long stagiaireId) {
        Projet projet = projetRepository.findFirstByStagiaires_Id(stagiaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun projet affecté à ce stagiaire"));
        return getProjetDTOById(projet.getId());
    }

    public Map<String, Object> getStatsParProjetPourEncadrant(Long encadrantId) {
        List<Projet> projets = projetRepository.findByEncadrantId(encadrantId);

        Map<String, Object> result = new HashMap<>();

        for (Projet projet : projets) {
            List<Tache> taches = tacheRepository.findByProjetId(projet.getId());

            long aFaire = taches.stream().filter(t -> t.getEtat() == EtatTache.A_FAIRE).count();
            long enCours = taches.stream().filter(t -> t.getEtat() == EtatTache.EN_COURS).count();
            long termine = taches.stream().filter(t -> t.getEtat() == EtatTache.TERMINE).count();
            long bloque = taches.stream().filter(t -> t.getEtat() == EtatTache.BLOQUE).count();

            Map<String, Long> statsProjet = new HashMap<>();
            statsProjet.put("total", (long) taches.size());
            statsProjet.put("aFaire", aFaire);
            statsProjet.put("enCours", enCours);
            statsProjet.put("termine", termine);
            statsProjet.put("bloque", bloque);

            result.put(projet.getTitre(), statsProjet);
        }

        return result;
    }


    public Map<String, Map<String, Long>> getGlobalStats() {
        List<Projet> projets = projetRepository.findAll();
        Map<String, Map<String, Long>> stats = new HashMap<>();

        for (Projet projet : projets) {
            List<Tache> taches = tacheRepository.findByProjetId(projet.getId());

            long aFaire = taches.stream().filter(t -> t.getEtat() == EtatTache.A_FAIRE).count();
            long enCours = taches.stream().filter(t -> t.getEtat() == EtatTache.EN_COURS).count();
            long termine = taches.stream().filter(t -> t.getEtat() == EtatTache.TERMINE).count();
            long bloque = taches.stream().filter(t -> t.getEtat() == EtatTache.BLOQUE).count();

            Map<String, Long> projetStats = new HashMap<>();
            projetStats.put("total", (long) taches.size());
            projetStats.put("aFaire", aFaire);
            projetStats.put("enCours", enCours);
            projetStats.put("termine", termine);
            projetStats.put("bloque", bloque);

            stats.put(projet.getTitre(), projetStats);
        }
        return stats;
    }

    public Projet updateProjet(Long id, String titre, String description,
                               LocalDate dateDebut, LocalDate dateFin, MultipartFile file) throws IOException {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec id=" + id));

        if (titre != null) projet.setTitre(titre);
        if (description != null) projet.setDescription(description);
        if (dateDebut != null) projet.setDateDebut(dateDebut);
        if (dateFin != null) projet.setDateFin(dateFin);

        if (file != null && !file.isEmpty()) {
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;
            Path uploadPath = Paths.get("uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);
            projet.setFile(uniqueFileName);
        }

        return projetRepository.save(projet);
    }

    @Transactional
    public void removeStagiaireFromProjet(Long projetId, Long stagiaireId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet non trouvé avec id=" + projetId));

        User stagiaire = userRepository.findById(stagiaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Stagiaire non trouvé avec id=" + stagiaireId));

        // Supprimer la relation
        stagiaire.setProjet(null);
        userRepository.save(stagiaire);
    }

    public List<ProjetDTO> getLast5ByEncadrant(Long encadrantId) {
        return projetRepository.findTop5ByEncadrantIdOrderByCreatedAtDesc(encadrantId)
                .stream()
                .map(p -> new ProjetDTO(
                        p.getId(),
                        p.getTitre(),
                        p.getDescription(),
                        p.getDateDebut(),
                        p.getDateFin(),
                        p.getFile(),
                        p.getEncadrant() != null ? p.getEncadrant().getFirstName() + " " + p.getEncadrant().getLastName() : null,
                        p.getStagiaires() != null ?
                                p.getStagiaires().stream()
                                        .map(s -> new StagiaireDTO(s.getId(), s.getFirstName(), s.getLastName(), s.getEmail()))
                                        .toList()
                                : List.of()
                ))
                .toList();
    }

}
