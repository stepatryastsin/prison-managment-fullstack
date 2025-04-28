package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@Transactional
public class BorrowedServiceImpl implements BorrowedService {

    private final BorrowedRepository repo;

    @Autowired
    public BorrowedServiceImpl(BorrowedRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Borrowed> findAll() {
        return repo.findAll();
    }

    @Override
    public Borrowed findById(BorrowedKey id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Запись Borrowed с ключом=" + id + " не найдена"));
    }

    @Override
    public Prisoner findPrisonerByPrisonerId(Integer prisonerId) {
        return repo.findPrisonerByPrisonerId(prisonerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Prisoner с id=" + prisonerId + " не найден"));
    }

    @Override
    public Library findLibraryByIsbn(String isbn) {
        return repo.findLibraryByIsbn(isbn)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Library с ISBN=" + isbn + " не найдена"));
    }

    @Override
    public Borrowed create(Borrowed borrowed) {
        BorrowedKey id = borrowed.getId();
        if (repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Запись Borrowed с ключом=" + id + " уже существует");
        }
        return repo.save(borrowed);
    }

    @Override
    public Borrowed update(BorrowedKey id, Borrowed borrowed) {
        Borrowed existing = findById(id);
        existing.setPrisoner(borrowed.getPrisoner());
        existing.setLibrary(borrowed.getLibrary());
        return repo.save(existing);
    }

    @Override
    public void delete(BorrowedKey id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись Borrowed с ключом=" + id + " не найдена");
        }
        repo.deleteById(id);
    }
}