package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.EnrolledIn;
import com.example.PrisonManagement.Entity.EnrolledInKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrolledInRepository
        extends JpaRepository<EnrolledIn, EnrolledInKey>
{}
