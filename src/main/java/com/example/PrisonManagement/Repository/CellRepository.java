package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Cell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CellRepository
        extends JpaRepository<Cell, Integer>
{

}