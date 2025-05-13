package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Borrowed;
import com.example.PrisonManagement.Model.BorrowedKey;
import com.example.PrisonManagement.Model.Library;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.BorrowedRepository;
import com.example.PrisonManagement.Service.BorrowedService;
import com.example.PrisonManagement.Service.LibraryService;
import com.example.PrisonManagement.Service.PrisonerService;
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
public class BorrowedServiceImpl implements BorrowedService {

    private static final Logger logger = LoggerFactory.getLogger(BorrowedServiceImpl.class);

    private final BorrowedRepository repo;
    private final PrisonerService prisonerService;
    private final LibraryService libraryService;

    @Autowired
    public BorrowedServiceImpl(
            BorrowedRepository repo,
            PrisonerService prisonerService,
            LibraryService libraryService
    ) {
        this.repo = repo;
        this.prisonerService = prisonerService;
        this.libraryService = libraryService;
        logger.info("BorrowedServiceImpl initialized");
    }

    @Override
    public List<Borrowed> findAll() {
        logger.info("Fetching all Borrowed records");
        return repo.findAll();
    }

    @Override
    public Borrowed findById(BorrowedKey id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
    }

    @Override
    public Borrowed create(Integer prisonerId, String isbn) {
        Prisoner prisoner = prisonerService.findById(prisonerId);
        if (prisoner == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prisoner not found");

        Library library = libraryService.findByIsbn(isbn);
        if (library == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Library not found");

        BorrowedKey key = new BorrowedKey(library.getInternalId(), prisoner.getPrisonerId());
        if (repo.existsById(key)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already exists");
        }

        Borrowed borrowed = new Borrowed(prisoner, library);
        return repo.save(borrowed);
    }


    @Override
    public Borrowed update(BorrowedKey id, Integer prisonerId, String isbn) {
        Borrowed existing = findById(id);
        Prisoner prisoner = prisonerService.findById(prisonerId);
        Library library = libraryService.findByIsbn(isbn);

        if (prisoner == null || library == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid prisoner or library");

        existing.setPrisoner(prisoner);
        existing.setLibrary(library);
        return repo.save(existing);
    }

    @Override
    public void delete(BorrowedKey id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        repo.deleteById(id);
    }
}
