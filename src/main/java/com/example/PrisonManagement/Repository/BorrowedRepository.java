package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowedRepository extends JpaRepository<Borrowed, BorrowedKey> {

    // Проверяет, заимствована ли книга с данным internalId
    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
          FROM Borrowed b
         WHERE b.id.libraryId = :libraryId
    """)
    boolean existsByLibraryId(@Param("libraryId") Long libraryId);

    // При желании, найти всех заключённых, удерживающих данную книгу:
    @Query("""
        SELECT b.prisoner
          FROM Borrowed b
         WHERE b.id.libraryId = :libraryId
    """)
    List<Prisoner> findPrisonersByLibraryId(@Param("libraryId") Long libraryId);
}