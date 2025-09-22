// Utilisateur.java
package com.stagiaflow.authservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "USERS")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Géré par la BDD
    private Long id;
    @Column(name = "LastName")
    private String lastName;
    @Column(name = "FirstName")
    private String firstName;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String photo;

    @Enumerated(EnumType.STRING)
    private Departement departement;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean valide = false;

    @Transient // Non stocké en BDD
    private Long tempId;
}
