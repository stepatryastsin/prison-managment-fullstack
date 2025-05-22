package com.example.PrisonManagement.Service;

import java.io.ByteArrayOutputStream;

public interface CertificateService {
    /**
     * Генерирует PDF-сертификат для указанного заключённого и курса.
     * @return PDF в виде массива байт.
     */
    ByteArrayOutputStream generateCertificate(Integer prisonerId, Integer courseId);
}