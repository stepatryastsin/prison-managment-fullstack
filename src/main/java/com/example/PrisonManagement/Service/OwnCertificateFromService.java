package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.OwnCertificateFrom;

import java.io.ByteArrayOutputStream;
import java.util.List;


public interface OwnCertificateFromService {

    List<OwnCertificateFrom> findAll();

    OwnCertificateFrom findById(Integer prisonerId, Integer courseId);

    OwnCertificateFrom create(OwnCertificateFrom ownCertificate);

    OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificate);

    void delete(Integer prisonerId, Integer courseId);

}