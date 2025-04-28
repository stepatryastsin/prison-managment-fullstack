package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.EnrolledInKey;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import com.example.PrisonManagement.Repository.EnrolledInRepository;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class OwnCertificateFromServiceImpl implements OwnCertificateFromService {

    private final OwnCertificateFromRepository certRepo;
    private final EnrolledInRepository enrollRepo;

    @Autowired
    public OwnCertificateFromServiceImpl(OwnCertificateFromRepository certRepo,
                                         EnrolledInRepository enrollRepo) {
        this.certRepo   = certRepo;
        this.enrollRepo = enrollRepo;
    }

    @Override
    public List<OwnCertificateFrom> findAll() {
        return certRepo.findAll();
    }

    @Override
    public OwnCertificateFrom findById(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        return certRepo.findById(key)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate " + key + " not found"
                ));
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom ownCertificate) {
        OwnCertificateFromKey key = ownCertificate.getId();
        if (certRepo.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate " + key + " already exists"
            );
        }
        return certRepo.save(ownCertificate);
    }

    @Override
    public OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificate) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        if (!certRepo.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Certificate " + key + " not found"
            );
        }
        // Preserve the key so update doesn’t create a new one
        ownCertificate.setId(key);
        return certRepo.save(ownCertificate);
    }

    @Override
    public void delete(Integer prisonerId, Integer courseId) {
        // 1) Delete the certificate itself
        OwnCertificateFromKey certKey = new OwnCertificateFromKey(prisonerId, courseId);
        OwnCertificateFrom cert = certRepo.findById(certKey)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate " + certKey + " not found"
                ));
        certRepo.delete(cert);

        // 2) Also remove any leftover enrollment for this prisoner-course pair
        EnrolledInKey enrollKey = new EnrolledInKey(prisonerId, courseId);
        enrollRepo.findById(enrollKey)
                .ifPresent(enrollRepo::delete);
    }
}