package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Library;
import java.util.List;


public interface LibraryService {
    List<Library> findAll();
    Library findByIsbn(String isbn);
    Library create(Library library);
    Library update(String isbn, Library library);
    void delete(String isbn);
}