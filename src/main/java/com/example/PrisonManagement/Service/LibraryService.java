package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.Library;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LibraryService {
    List<Library> getAllLibrary();
    Library getById(BigDecimal id);
    Library createLibrary(Library library);
    Library updateLibrary(BigDecimal id, Library library);
    void deleteLibrary(BigDecimal id);
}