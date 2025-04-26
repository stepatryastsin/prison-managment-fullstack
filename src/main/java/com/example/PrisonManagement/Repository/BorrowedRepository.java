package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import com.example.PrisonManagement.Entity.Library;
import com.example.PrisonManagement.Entity.Prisoner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.util.Optional;

public interface BorrowedRepository extends
        JpaRepository<Borrowed, BorrowedKey> {

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Borrowed b " +
                                          "WHERE b.prisoner.prisonerId = :prisonerId")
    boolean existsByPrisoner_PrisonerId(@Param("prisonerId") Integer prisonerId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false " +
                    "END FROM Borrowed b WHERE b.id.isbn = :isbn")
    boolean existsByIsbn(@Param("isbn") String isbn);

    @Query("""
      SELECT DISTINCT b.prisoner
        FROM Borrowed b
       WHERE b.prisoner.prisonerId = :prisonerId
      """)
    Optional<Prisoner> findPrisonerByPrisonerId(@Param("prisonerId") Integer prisonerId);

    @Query("""
      SELECT b.library
        FROM Borrowed b
       WHERE b.id.isbn = :isbn
      """)
    Optional<Library> findLibraryByIsbn(@Param("isbn") String isbn);

}