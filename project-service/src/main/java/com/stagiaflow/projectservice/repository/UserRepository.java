package com.stagiaflow.projectservice.repository;

import com.stagiaflow.projectservice.entities.Role;
import com.stagiaflow.projectservice.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {


    List<User> findByFirstNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String firstName, String email);

    // Tous les stagiaires affectés à un projet
    List<User> findByProjetId(Long projetId);

    // Tous les utilisateurs par rôle
    List<User> findByRole(Role role);

    Optional<User> findByEmail(String email);

    long countByRole(Role role);


}
