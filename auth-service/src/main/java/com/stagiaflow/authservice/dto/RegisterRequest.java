// ✅ RegisterRequest.java
package com.stagiaflow.authservice.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private String LastName;
    private String FirstName;
    private String email;
    private String Password;
    private String role; //


}
