// src/main/java/com/stagiaflow/projectservice/controller/TacheController.java
package com.stagiaflow.projectservice.controller;

import com.stagiaflow.projectservice.dto.TacheDTO;
import com.stagiaflow.projectservice.entities.EtatTache;
import com.stagiaflow.projectservice.entities.Tache;
import com.stagiaflow.projectservice.repository.TacheRepository;
import com.stagiaflow.projectservice.services.TacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;
    private final TacheRepository tacheRepository;

    // Créer une tâche
    @PostMapping("/taches")
    public ResponseEntity<TacheDTO> create(@RequestBody TacheDTO dto) {
        return ResponseEntity.ok(tacheService.create(dto));
    }

    @GetMapping("/{projetId}/taches")
    public ResponseEntity<List<TacheDTO>> listByProjet(@PathVariable("projetId") Long projetId) {
        return ResponseEntity.ok(tacheService.listByProjet(projetId));
    }

    @PutMapping("/taches/{tacheId}")
    public ResponseEntity<TacheDTO> update(@PathVariable("tacheId") Long tacheId,
                                           @RequestBody TacheDTO dto) {
        return ResponseEntity.ok(tacheService.update(tacheId, dto));
    }

    @DeleteMapping("/taches/{tacheId}")
    public ResponseEntity<Void> delete(@PathVariable("tacheId") Long tacheId) {
        tacheService.delete(tacheId);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/taches/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable("id") Long id,
                                          @RequestBody Map<String, String> payload) {
        try {
            String statut = payload.get("statut");
            EtatTache etatEnum = EtatTache.valueOf(statut); // conversion String -> Enum

            Tache tache = tacheRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tâche introuvable avec id " + id));
            tache.setEtat(etatEnum);

            Tache updated = tacheRepository.save(tache);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Statut invalide : " + payload.get("statut"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur serveur : " + e.getMessage());
        }
    }



}
