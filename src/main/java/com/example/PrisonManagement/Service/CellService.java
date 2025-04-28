package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Model.Cell;

import java.util.List;
import java.util.Optional;


public interface CellService {

    List<Cell> findAll();

    Cell findById(Integer id);

    Cell create(Cell cell);

    Cell update(Integer id, Cell cell);

    void delete(Integer id);

    boolean hasPrisoners(Integer id);

}