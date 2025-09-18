package com.stagiaflow.authservice.dto;

public class LoginRequest {
    private String email;
    private String password; // 🔁 Correction ici : "Password" devient "password" (bonne pratique Java)

    // Getters et setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password; // ✅ On retourne le champ, pas la méthode
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
