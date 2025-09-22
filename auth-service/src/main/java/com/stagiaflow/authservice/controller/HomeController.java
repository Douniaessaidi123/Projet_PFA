package com.stagiaflow.authservice.controller;

import com.stagiaflow.authservice.entity.User;
import com.stagiaflow.authservice.repository.UserRepository;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final UserRepository userRepository;

    public HomeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/home")
    public String home(OAuth2AuthenticationToken authentication) {
        // 🔹 Récupérer l'email depuis le token Azure AD
        String email = authentication.getPrincipal().getAttribute("preferred_username");

        // 🔹 Chercher l'utilisateur dans la base
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + email));

        // 🔹 Déterminer l'URL de redirection
        String redirectUrl;
        switch (user.getRole()) {
            case ADMIN:
                redirectUrl = "redirect:http://localhost:4200/admin/dashboard";
                break;
            case ENCADRANT:
                redirectUrl = "redirect:http://localhost:4200/encadrant/dashboard";
                break;
            case STAGIAIRE:
                redirectUrl = "redirect:http://localhost:4200/stagiaire/dashboard";
                break;
            default:
                redirectUrl = "redirect:http://localhost:4200/login";
                break;
        }

        // 🔹 Redirection vers Angular
        return redirectUrl;
    }
}
