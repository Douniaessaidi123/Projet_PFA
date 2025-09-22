package com.stagiaflow.communicationservice.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "LastName")
    private String lastName;
    @Column(name = "FirstName")
    private String firstName;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Departement departement;

    private String photo;

    private boolean valide = false;



    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Message> messages;

    //pls projets pour un encadrant
    @OneToMany(mappedBy = "encadrant")
    @JsonIgnore
    private List<Projet> projetsEncadres;


    @ManyToOne
    @JoinColumn(name = "projet_id")

    @JsonIgnore
    private Projet projet;

    @OneToMany(mappedBy = "stagiaire")
    @JsonIgnore
    private List<Tache> tachesAssignees;


}

