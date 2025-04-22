package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import com.example.PrisonManagement.Entity.OwnCertificateFromKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OwnCertificateFromRepository
        extends JpaRepository<OwnCertificateFrom, OwnCertificateFromKey> {
}