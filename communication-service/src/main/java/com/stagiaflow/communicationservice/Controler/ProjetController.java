package com.stagiaflow.communicationservice.Controler;

import com.stagiaflow.communicationservice.DTO.TeamDTO;
import com.stagiaflow.communicationservice.Model.Projet;
import com.stagiaflow.communicationservice.Service.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ProjetController {

    private final ProjetService projetService;

    // ✅ Récupérer projets avec canal créé (sidebar)
    @GetMapping("/encadrant/{encadrantId}/teams")
    public ResponseEntity<List<TeamDTO>> getTeamsByEncadrant(@PathVariable ("encadrantId") Long encadrantId) {
        return ResponseEntity.ok(projetService.getTeamsByEncadrant(encadrantId));
    }

    // ✅ Récupérer projets sans canal créé (pour créer canal)
    @GetMapping("/encadrant/{encadrantId}/projects")
    public ResponseEntity<List<Projet>> getProjectsWithoutChannel(@PathVariable ("encadrantId") Long encadrantId) {
        return ResponseEntity.ok(projetService.getProjectsWithoutChannel(encadrantId));
    }

    // ✅ Créer canal pour un projet
    @PostMapping("/{projetId}/create-channel")
    public ResponseEntity<TeamDTO> createChannel(@PathVariable ("projetId") Long projetId) {
        return ResponseEntity.ok(projetService.createChannel(projetId));
    }

    // ✅ Récupérer une équipe par projet
    @GetMapping("/{projetId}/team")
    public ResponseEntity<TeamDTO> getTeamByProjet(@PathVariable ("projetId") Long projetId) {
        return ResponseEntity.ok(projetService.getTeamByProjetId(projetId));
    }

    // ✅ Récupérer les groupes visibles pour un stagiaire
    @GetMapping("/stagiaire/{stagiaireId}/teams")
    public ResponseEntity<List<TeamDTO>> getTeamsByStagiaire(@PathVariable("stagiaireId") Long stagiaireId) {
        return ResponseEntity.ok(projetService.getTeamsByStagiaire(stagiaireId));
    }

}
