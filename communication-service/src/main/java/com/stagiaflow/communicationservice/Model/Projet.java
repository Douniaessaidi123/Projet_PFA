package com.stagiaflow.communicationservice.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name ="projet")
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter @Builder @ToString
@Data
public class Projet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String file;


    @ManyToOne
    @JoinColumn(name = "encadrant_id")
    @JsonIgnoreProperties
    private User encadrant;

    //un projet peut avoir pls stagiares
    @OneToMany(mappedBy = "projet")
    @JsonIgnore
    private List<User> stagiaires;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tache> taches;
    // ✅ Nouveau champ pour savoir si le canal est créé
    private boolean ChannelCreated = false;


    public boolean isChannelCreated() {
        return ChannelCreated;
    }

}
