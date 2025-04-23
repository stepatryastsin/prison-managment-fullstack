package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Cell;
import java.util.List;


public interface CellService {
    List<Cell> getAllCells();
    Cell getById(Integer id);
    Cell createCell(Cell cell);
    Cell updateCell(Integer id, Cell cell);
    void deleteCell(Integer id);
}