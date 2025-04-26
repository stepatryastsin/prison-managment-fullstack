package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {

    // поиск по NaturalId
    Optional<Library> findByIsbn(String isbn);

    // проверка существования по ISBN
    boolean existsByIsbn(String isbn);

    // удаление по ISBN
    void deleteByIsbn(String isbn);
}