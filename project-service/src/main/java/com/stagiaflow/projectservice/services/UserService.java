package com.stagiaflow.projectservice.services;

import com.stagiaflow.projectservice.dto.UserProfileDTO;
import com.stagiaflow.projectservice.entities.Role;
import com.stagiaflow.projectservice.entities.User;
import com.stagiaflow.projectservice.exceptions.ResourceNotFoundException;
import com.stagiaflow.projectservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    // Tous les stagiaires
    public List<User> getAllStagiaires() {
        return userRepository.findByRole(Role.STAGIAIRE);
    }

    // Tous les encadrants
    public List<User> getAllEncadrants() {
        return userRepository.findByRole(Role.ENCADRANT);
    }

    // Rechercher par nom ou email
    public List<User> searchUsers(String keyword) {
        return userRepository.findByFirstNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword);
    }

    // Utilisateur par ID
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }


    // ---- Utils ---------------------------------------------------------------
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // ---- Profil --------------------------------------------------------------
    public User updateProfile(Long id, UserProfileDTO dto) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (dto.getFirstName()  != null) u.setFirstName(dto.getFirstName());
        if (dto.getLastName()   != null) u.setLastName(dto.getLastName());
        if (dto.getEmail()      != null) u.setEmail(dto.getEmail());      // si autorisé
        if (dto.getDepartement()!= null) u.setDepartement(dto.getDepartement());

        return userRepository.save(u);
    }

    @Transactional
    public Map<String, String> updatePhoto(Long id, MultipartFile file) throws Exception {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Path uploadPath = Paths.get("uploads/avatars").toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String ext = Optional.ofNullable(file.getOriginalFilename())
                .map(StringUtils::getFilenameExtension)
                .map(e -> "." + e)
                .orElse(".jpg");

        String fileName = System.currentTimeMillis() + "_" + id + ext;
        Path target = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        u.setPhoto(fileName);
        userRepository.save(u);

        String url = "/api/users/photos/" + fileName;
        return Map.of("photo", fileName, "url", url);
    }

    public byte[] loadPhoto(String fileName) throws Exception {
        Path p = Paths.get("uploads/avatars").toAbsolutePath().normalize().resolve(fileName);
        if (!Files.exists(p)) return null;
        return Files.readAllBytes(p);
    }

    public String detectPhotoContentType(String fileName) {
        try {
            Path p = Paths.get("uploads/avatars").toAbsolutePath().normalize().resolve(fileName);
            return Files.probeContentType(p);
        } catch (Exception ignored) { return null; }
    }

}
