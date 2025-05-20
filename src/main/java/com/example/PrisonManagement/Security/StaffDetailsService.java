package com.example.PrisonManagement.Security;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Repository.StaffRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class StaffDetailsService implements UserDetailsService {

    private final StaffRepository repo;
    private final PasswordEncoder encoder;

    public StaffDetailsService(StaffRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        Staff s = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.builder()
                .username(s.getUsername())
                .password(s.getPassword())
                .disabled(!s.isEnabled())
                .roles(s.getJob().getJobDescription())
                .build();
    }
    public Staff setPassword(String username, String rawPassword) {
        Staff s = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        s.setPassword(encoder.encode(rawPassword));
        return repo.save(s);
    }
}