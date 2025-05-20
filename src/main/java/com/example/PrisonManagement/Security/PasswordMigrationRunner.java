package com.example.PrisonManagement.Security;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Repository.StaffRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordMigrationRunner implements ApplicationRunner {

    private final StaffRepository repo;
    private final PasswordEncoder encoder;

    public PasswordMigrationRunner(StaffRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    @Transactional

    public void run(ApplicationArguments args) {
        for (Staff s : repo.findAll()) {
            String pw = s.getPassword();
            if (!pw.startsWith("$2a$")) {
                // Перекодируем старый plain-text пароль в BCrypt
                s.setPassword(encoder.encode(pw));
                repo.save(s);
            }
        }
    }
}