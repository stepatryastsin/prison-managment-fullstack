package com.example.PrisonManagement.impl;


import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Repository.CellDao;
import com.example.PrisonManagement.Repository.PrisonerDao;
import com.example.PrisonManagement.Service.CellService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@Transactional
public class CellServiceImpl implements CellService {

    private static final org.slf4j.Logger logger =
            org.slf4j.LoggerFactory.getLogger(CellServiceImpl.class);

    private final CellDao       cellDao;
    private final PrisonerDao   prisonerDao;

    @Autowired
    public CellServiceImpl(CellDao cellDao, PrisonerDao prisonerDao) {
        this.cellDao     = cellDao;
        this.prisonerDao = prisonerDao;
        logger.info("CellServiceImpl initialized");
    }

    @Override
    public List<Cell> findAll() {
        logger.info("Fetching all cells");
        return cellDao.findAll();
    }

    @Override
    public Cell findById(Integer id) {
        logger.info("Fetching cell id={}", id);
        return cellDao.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Cell id={} not found", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Cell with id=" + id + " not found");
                });
    }

    @Override
    public Cell create(Cell cell) {
        Integer id = cell.getCellNum();
        logger.info("Creating cell id={}", id);
        if (cellDao.existsById(id)) {
            logger.warn("Conflict: cell id={} already exists", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cell with id=" + id + " already exists");
        }
        return cellDao.create(cell);
    }

    @Override
    public Cell update(Integer id, Cell cell) {
        logger.info("Updating cell id={}", id);
        Cell existing = findById(id);
        existing.setLastShakedownDate(cell.getLastShakedownDate());
        return cellDao.update(existing);
    }

    @Override
    public void delete(Integer id) {
        logger.info("Deleting cell id={}", id);
        if (!cellDao.existsById(id)) {
            logger.warn("Cell id={} not found", id);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Cell with id=" + id + " not found");
        }
        cellDao.delete(id);
    }

    @Override
    public boolean hasPrisoners(Integer id) {
        logger.info("Checking prisoners in cell id={}", id);
        boolean result = prisonerDao.existsByCellNum(id);
        logger.info("Cell id={} has prisoners: {}", id, result);
        return result;
    }
}
