package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OwnCertificateFromRepository extends JpaRepository<OwnCertificateFrom, OwnCertificateFromKey> {

    List<OwnCertificateFrom> findByIdPrisonerId(Integer prisonerId);

    List<OwnCertificateFrom> findByIdCourseId(Integer courseId);

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM OwnCertificateFrom c
         WHERE c.id.prisonerId = :prisonerId
           AND c.id.courseId   = :courseId
    """)
    int deleteByPrisonerIdAndCourseId(Integer prisonerId, Integer courseId);
}