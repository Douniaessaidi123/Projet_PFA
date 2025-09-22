package com.stagiaflow.projectservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StagiaireDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
