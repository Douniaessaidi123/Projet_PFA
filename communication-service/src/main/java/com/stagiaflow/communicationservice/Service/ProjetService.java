package com.stagiaflow.communicationservice.Service;

import com.stagiaflow.communicationservice.DTO.TeamDTO;
import com.stagiaflow.communicationservice.DTO.UserDTO;
import com.stagiaflow.communicationservice.Model.Projet;
import com.stagiaflow.communicationservice.Model.Role;
import com.stagiaflow.communicationservice.Model.User;
import com.stagiaflow.communicationservice.Repository.ProjetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetService {

    private final ProjetRepository projetRepository;

    // ✅ Récupérer les projets avec canal créé
    public List<TeamDTO> getTeamsByEncadrant(Long encadrantId) {
        List<Projet> projets = projetRepository.findByEncadrantId(encadrantId);
        return projets.stream()
                .filter(projet -> Boolean.TRUE.equals(projet.isChannelCreated()))
                .map(projet -> getTeamByProjetId(projet.getId()))
                .toList();
    }

    // ✅ Récupérer les projets sans canal créé
    public List<Projet> getProjectsWithoutChannel(Long encadrantId) {
        List<Projet> projets = projetRepository.findByEncadrantId(encadrantId);
        return projets.stream()
                .filter(projet -> !Boolean.TRUE.equals(projet.isChannelCreated()))
                .toList();
    }

    // ✅ Créer un canal pour un projet
    public TeamDTO createChannel(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        if (!Boolean.TRUE.equals(projet.isChannelCreated())) {
            projet.setChannelCreated(true);
            projetRepository.save(projet);
        }
        return getTeamByProjetId(projetId);
    }

    // ✅ Récupérer une équipe par projet
    public TeamDTO getTeamByProjetId(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        User encadrant = projet.getEncadrant();
        UserDTO encadrantDTO = UserDTO.builder()
                .id(encadrant.getId())
                .firstName(encadrant.getFirstName())
                .lastName(encadrant.getLastName())
                .email(encadrant.getEmail())
                .role(encadrant.getRole().name())
                .build();

        List<UserDTO> stagiairesDTO = projet.getStagiaires().stream()
                .filter(user -> user.getRole() == Role.STAGIAIRE)
                .map(s -> UserDTO.builder()
                        .id(s.getId())
                        .firstName(s.getFirstName())
                        .lastName(s.getLastName())
                        .email(s.getEmail())
                        .role(s.getRole().name())
                        .build())
                .toList();

        return TeamDTO.builder()
                .projetId(projet.getId())
                .projetTitre(projet.getTitre())
                .encadrant(encadrantDTO)
                .stagiaires(stagiairesDTO)
                .teamCreated(projet.isChannelCreated())
                .build();
    }

    public List<TeamDTO> getTeamsByStagiaire(Long stagiaireId) {
        List<Projet> projets = projetRepository.findAll().stream()
                .filter(p -> p.isChannelCreated() &&
                        p.getStagiaires().stream().anyMatch(s -> s.getId().equals(stagiaireId)))
                .toList();

        return projets.stream()
                .map(projet -> getTeamByProjetId(projet.getId()))
                .toList();
    }


}
