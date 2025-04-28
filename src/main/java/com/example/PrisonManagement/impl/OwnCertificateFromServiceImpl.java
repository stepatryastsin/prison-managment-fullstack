package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
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

    private final OwnCertificateFromRepository repo;

    @Autowired
    public OwnCertificateFromServiceImpl(OwnCertificateFromRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<OwnCertificateFrom> findAll() {
        return repo.findAll();
    }

    @Override
    public OwnCertificateFrom findById(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        return repo.findById(key)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate " + key + " not found"));
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom ownCertificate) {
        OwnCertificateFromKey key = ownCertificate.getId();
        if (repo.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate " + key + " already exists");
        }
        return repo.save(ownCertificate);
    }

    @Override
    public OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificate) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        if (!repo.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Certificate " + key + " not found");
        }
        // preserve key
        ownCertificate.setId(key);
        return repo.save(ownCertificate);
    }

    @Override
    public void delete(Integer prisonerId, Integer courseId) {
        int deleted = repo.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        if (deleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Certificate (" + prisonerId + "," + courseId + ") not found");
        }
    }
}