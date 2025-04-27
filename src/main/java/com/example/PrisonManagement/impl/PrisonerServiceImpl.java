package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.PrisonerService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class PrisonerServiceImpl implements PrisonerService {

    private final PrisonerRepository repo;

    @Autowired
    public PrisonerServiceImpl(PrisonerRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Prisoner> getAll() {
        return repo.findAll();
    }

    @Override
    public Prisoner findById(Integer id) {
        return repo.findByPrisonerId(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Заключённый с id=" + id + " не найден"));
    }

    @Override
    public Prisoner create(Prisoner prisoner) {
        Integer id = prisoner.getPrisonerId();
        if (repo.existsByPrisonerId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Заключённый с id=" + id + " уже существует");
        }
        return repo.save(prisoner);
    }

    @Override
    public Prisoner update(Integer id, Prisoner prisoner) {
        Prisoner existing = findById(id);
        existing.setFirstName(prisoner.getFirstName());
        existing.setLastName(prisoner.getLastName());
        existing.setBirthPlace(prisoner.getBirthPlace());
        existing.setDateOfBirth(prisoner.getDateOfBirth());
        existing.setOccupation(prisoner.getOccupation());
        existing.setIndictment(prisoner.getIndictment());
        existing.setIntakeDate(prisoner.getIntakeDate());
        existing.setSentenceEndDate(prisoner.getSentenceEndDate());
        existing.setCell(prisoner.getCell());
        existing.setSecurityLevel(prisoner.getSecurityLevel());
        existing.setReleased(prisoner.getReleased());
        return repo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (!repo.existsByPrisonerId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Заключённый с id=" + id + " не найден");
        }
        repo.deleteByPrisonerId(id);
    }
}