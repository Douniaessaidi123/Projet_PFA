package com.stagiaflow.communicationservice.Repository;


import com.stagiaflow.communicationservice.Model.Projet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long>{
    // Liste des projets encadrés par un encadrant
    List<Projet> findByEncadrantId(Long encadrantId);
}
