package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import java.util.List;


public interface OwnCertificateFromService {
    List<OwnCertificateFrom> getAll();
    OwnCertificateFrom getById(Integer prisonerId, Integer courseId);
    OwnCertificateFrom create(OwnCertificateFrom ownCertificateFrom);
    OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificateFrom);
    OwnCertificateFrom delete(Integer prisonerId, Integer courseId);
}