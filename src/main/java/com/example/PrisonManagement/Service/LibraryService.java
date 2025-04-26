package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.Library;
import java.math.BigDecimal;
import java.util.List;


public interface LibraryService {
    List<Library> getAllLibrary();
    Library getByIsbn(String isbn);
    Library createLibrary(Library library);
    Library updateLibrary(String isbn, Library library);
    void deleteLibrary(String isbn);
}