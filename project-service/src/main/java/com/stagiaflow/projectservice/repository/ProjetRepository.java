package com.stagiaflow.projectservice.repository;

import com.stagiaflow.projectservice.entities.Projet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjetRepository extends JpaRepository<Projet, Long> {

    // Liste des projets encadrés par un encadrant
    List<Projet> findByEncadrantId(Long encadrantId);

    // Chercher un projet par titre (optionnel)
    List<Projet> findByTitreContainingIgnoreCase(String keyword);

    Optional<Projet> findFirstByStagiaires_Id(Long stagiaireId);

    List<Projet> findTop5ByEncadrantIdOrderByCreatedAtDesc(Long encadrantId);

}
