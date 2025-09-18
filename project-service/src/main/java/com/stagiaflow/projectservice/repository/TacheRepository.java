package com.stagiaflow.projectservice.repository;

import com.stagiaflow.projectservice.entities.EtatTache;
import com.stagiaflow.projectservice.entities.Tache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {


    // Tâches d’un projet
    List<Tache> findByProjetId(Long projetId);

    // Tâches assignées à un stagiaire
    List<Tache> findByStagiaireId(Long stagiaireId);

    // Tâches d’un projet avec état spécifique
    List<Tache> findByProjetIdAndEtat(Long projetId, EtatTache etat);

    List<Tache> findByProjet_Encadrant_Id(Long encadrantId);

}
