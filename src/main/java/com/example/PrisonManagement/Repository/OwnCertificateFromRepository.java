package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import org.springframework.data.jpa.repository.JpaRepository;


public interface OwnCertificateFromRepository
        extends JpaRepository<OwnCertificateFrom, OwnCertificateFromKey> {
}