package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
@Repository
public interface LibraryRepository extends JpaRepository<Library, BigDecimal> {
}
