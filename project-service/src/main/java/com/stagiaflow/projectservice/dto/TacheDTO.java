package com.stagiaflow.projectservice.dto;

import com.stagiaflow.projectservice.entities.EtatTache;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TacheDTO {
    private Long id;
    private String titre;
    private LocalDate deadline;
    private EtatTache etat;
    private Long projetId;
    private Long stagiaireId;
    private String stagiaireEmail;
    private String stagiaireFirstName;
    private String stagiaireLastName;
}
