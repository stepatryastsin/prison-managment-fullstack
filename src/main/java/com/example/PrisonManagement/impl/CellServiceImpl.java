package com.example.PrisonManagement.impl;


import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Repository.CellRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.CellService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@Service
@Transactional
public class CellServiceImpl implements CellService {

    private final CellRepository repo;
    private final PrisonerRepository prisonerRepo;

    @Autowired
    public CellServiceImpl(CellRepository repo, PrisonerRepository prisonerRepo) {
        this.repo = repo;
        this.prisonerRepo = prisonerRepo;
    }

    @Override
    public List<Cell> findAll() {
        return repo.findAll();
    }

    @Override
    public Cell findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Камера с id=" + id + " не найдена"));
    }

    @Override
    public Cell create(Cell cell) {
        Integer id = cell.getCellNum();
        if (repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Камера с id=" + id + " уже существует");
        }
        return repo.save(cell);
    }

    @Override
    public Cell update(Integer id, Cell cell) {
        Cell existing = findById(id);
        existing.setLastShakedownDate(cell.getLastShakedownDate());
        return repo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Камера с id=" + id + " не найдена");
        }
        repo.deleteById(id);
    }

    @Override
    public boolean hasPrisoners(Integer id) {
        return prisonerRepo.existsByCell_CellNum(id);
    }
}