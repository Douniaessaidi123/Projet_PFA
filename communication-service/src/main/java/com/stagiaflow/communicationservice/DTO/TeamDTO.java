package com.stagiaflow.communicationservice.DTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDTO {
    private Long projetId;
    private String projetTitre;
    private UserDTO encadrant;
    private List<UserDTO> stagiaires;
    private Boolean teamCreated; // <-- pour savoir si le canal a été créé
}


