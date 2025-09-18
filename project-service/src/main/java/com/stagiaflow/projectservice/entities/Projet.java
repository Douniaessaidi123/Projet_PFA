package com.stagiaflow.projectservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name ="projet")
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter @Builder @ToString

public class Projet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String file;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    // ✅ Nouveau champ pour savoir si le canal est créé
    private boolean ChannelCreated = false;



    @ManyToOne
    @JoinColumn(name = "encadrant_id")
    @JsonIgnore
    private User encadrant;

    //un projet peut avoir pls stagiares
    @OneToMany(mappedBy = "projet")
    @JsonIgnoreProperties({"projet"})
    private List<User> stagiaires;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tache> taches;





}
