package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.EnrolledInKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrolledInRepository
        extends JpaRepository<EnrolledIn, EnrolledInKey>
{}
