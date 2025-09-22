package com.stagiaflow.projectservice.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor @Builder @Getter @Setter @ToString(exclude = {"projetsEncadres", "projet", "tachesAssignees"})

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "LastName")
    private String lastName;
    @Column(name = "FirstName")
    private String firstName;
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Departement departement;

    private String photo;

    //pls projets pour un encadrant
    @OneToMany(mappedBy = "encadrant")
    @JsonIgnore
    private List<Projet> projetsEncadres;


    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @OneToMany(mappedBy = "stagiaire")
    @JsonIgnore
    private List<Tache> tachesAssignees;




}
