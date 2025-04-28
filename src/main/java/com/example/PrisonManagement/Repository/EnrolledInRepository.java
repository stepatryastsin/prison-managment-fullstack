package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.EnrolledInKey;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrolledInRepository extends JpaRepository<EnrolledIn, EnrolledInKey> {

    List<EnrolledIn> findByIdPrisonerId(Integer prisonerId);

    List<EnrolledIn> findByIdCourseId(Integer courseId);

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM EnrolledIn e
         WHERE e.id.prisonerId = :prisonerId
           AND e.id.courseId   = :courseId
    """)
    int deleteByPrisonerIdAndCourseId(Integer prisonerId, Integer courseId);
}