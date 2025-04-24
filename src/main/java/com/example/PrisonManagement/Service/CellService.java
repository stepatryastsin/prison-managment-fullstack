package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Cell;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface CellService {
    List<Cell> getAllCells();
    Optional<Cell> getCellById(Integer id);
    Cell createCell(Cell cell);
    Cell updateCell(Integer id, Cell cell);
    void deleteCell(Integer id);
    boolean hasPrisoners(Integer id);
}