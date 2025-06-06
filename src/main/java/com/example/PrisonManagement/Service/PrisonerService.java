package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Model.Prisoner;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PrisonerService {
    List<Prisoner> getAll();
    Prisoner findById(Integer id);
    Prisoner create(Prisoner prisoner);
    Prisoner update(Integer id, Prisoner prisoner);
    void delete(Integer id);
}

