package com.stagiaflow.projectservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "taches")
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter @Builder @ToString
public class Tache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private EtatTache etat;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    @JsonIgnore
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "stagiaire_id")
    @JsonIgnore
    private User stagiaire;
}
