// src/main/java/com/stagiaflow/projectservice/services/TacheService.java
package com.stagiaflow.projectservice.services;

import com.stagiaflow.projectservice.dto.TacheDTO;
import com.stagiaflow.projectservice.entities.Tache;
import com.stagiaflow.projectservice.entities.User;
import com.stagiaflow.projectservice.repository.ProjetRepository;
import com.stagiaflow.projectservice.repository.TacheRepository;
import com.stagiaflow.projectservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TacheService {

    private final TacheRepository tacheRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    private TacheDTO toDto(Tache t) {
        TacheDTO dto = new TacheDTO();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDeadline(t.getDeadline());
        dto.setEtat(t.getEtat());
        dto.setProjetId(t.getProjet() != null ? t.getProjet().getId() : null);
        if (t.getStagiaire() != null) {
            dto.setStagiaireId(t.getStagiaire().getId());
            dto.setStagiaireEmail(t.getStagiaire().getEmail());
            dto.setStagiaireFirstName(t.getStagiaire().getFirstName());
            dto.setStagiaireLastName(t.getStagiaire().getLastName());
        }
        return dto;
    }

    /** Applique les champs présents dans le DTO à l'entité (PATCH-like). */
    private void applyDtoToEntity(TacheDTO dto, Tache entity) {
        if (dto.getTitre() != null)    entity.setTitre(dto.getTitre());
        if (dto.getDeadline() != null) entity.setDeadline(dto.getDeadline());
        if (dto.getEtat() != null)     entity.setEtat(dto.getEtat());

        // Projet (obligatoire en création, optionnel en update)
        if (dto.getProjetId() != null &&
                (entity.getProjet() == null || !dto.getProjetId().equals(entity.getProjet().getId()))) {
            var projet = projetRepository.findById(dto.getProjetId())
                    .orElseThrow(() -> new RuntimeException("Projet non trouvé (id=" + dto.getProjetId() + ")"));
            entity.setProjet(projet);
        }

        // Stagiaire par EMAIL prioritaire ; fallback par ID ; "" => désassignation
        if (dto.getStagiaireEmail() != null) {
            if (dto.getStagiaireEmail().isBlank()) {
                entity.setStagiaire(null); // désassigner
            } else {
                User assignee = userRepository.findByEmail(dto.getStagiaireEmail())
                        .orElseThrow(() -> new RuntimeException(
                                "Stagiaire non trouvé avec l'email: " + dto.getStagiaireEmail()));
                entity.setStagiaire(assignee);
            }
        } else if (dto.getStagiaireId() != null) {
            var assignee = userRepository.findById(dto.getStagiaireId())
                    .orElseThrow(() -> new RuntimeException(
                            "Stagiaire non trouvé (id=" + dto.getStagiaireId() + ")"));
            entity.setStagiaire(assignee);
        }
    }

    // CREATE
    public TacheDTO create(TacheDTO dto) {
        if (dto.getProjetId() == null) throw new RuntimeException("projetId obligatoire");
        var entity = new Tache();
        applyDtoToEntity(dto, entity);
        return toDto(tacheRepository.save(entity));
    }

    // READ (liste par projet)
    public List<TacheDTO> listByProjet(Long projetId) {
        return tacheRepository.findByProjetId(projetId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // UPDATE
    public TacheDTO update(Long tacheId, TacheDTO dto) {
        var entity = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée (id=" + tacheId + ")"));
        applyDtoToEntity(dto, entity);
        return toDto(tacheRepository.save(entity));
    }

    // DELETE
    public void delete(Long tacheId) {
        if (!tacheRepository.existsById(tacheId))
            throw new RuntimeException("Tâche non trouvée (id=" + tacheId + ")");
        tacheRepository.deleteById(tacheId);
    }
}
