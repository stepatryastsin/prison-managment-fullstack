package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.Borrowed;
import com.example.PrisonManagement.Entity.BorrowedKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

public interface BorrowedRepository extends JpaRepository<Borrowed, BorrowedKey> {

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Borrowed b WHERE b.prisoner.prisonerId = :prisonerId")
    boolean existsByPrisoner_PrisonerId(@Param("prisonerId") Integer prisonerId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Borrowed b WHERE b.id.isbn = :isbn")
    boolean existsByIsbn(@Param("isbn") BigDecimal isbn);
}