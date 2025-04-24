package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Entity.Prisoner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CellRepository
        extends JpaRepository<Cell, Integer>
{

}