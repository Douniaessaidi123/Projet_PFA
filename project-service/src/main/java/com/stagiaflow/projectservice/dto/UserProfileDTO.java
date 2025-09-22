package com.stagiaflow.projectservice.dto;

import com.stagiaflow.projectservice.entities.Departement;
import lombok.Data;

@Data
public class UserProfileDTO {
    private String firstName;
    private String lastName;
    private String email;
    private Departement departement;
}
