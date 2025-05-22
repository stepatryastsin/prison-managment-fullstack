package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Library;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


public interface LibraryService {
    List<Library> findAll();
    Library findByIsbn(String isbn);
    Library create(Library library);
    Library update(String isbn, Library library);
    void delete(String isbn);
    Library storePdf(String isbn, MultipartFile file) throws IOException;
    ByteArrayResource loadPdf(String isbn);
}