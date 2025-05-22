package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/staff")
@CrossOrigin("http://localhost:3000")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);
    private final StaffService service;

    @Autowired
    public StaffController(StaffService service) {
        this.service = service;
        logger.info("StaffController initialized");
    }

    @GetMapping
    public List<Staff> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Staff getOne(@PathVariable Integer id) {
        return service.findById(id);
    }

    // ——— Создание с загрузкой фото ———
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Staff create(
            @ModelAttribute @Valid Staff staff,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        // Если пришёл файл, сохраняем в поле photo (byte[])
        if (file != null && !file.isEmpty()) {
            staff.setPhoto(file.getBytes());
        }
        return service.create(staff);
    }

    // ——— Обновление с загрузкой/сменой фото ———
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Staff update(
            @PathVariable Integer id,
            @ModelAttribute @Valid Staff staff,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        // Устанавливаем фото, если есть
        if (file != null && !file.isEmpty()) {
            staff.setPhoto(file.getBytes());
        }
        // Сервис сам найдёт существующий объект и обновит нужные поля
        return service.update(id, staff);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/job/{jobId}/usage")
    public int getUsage(@PathVariable Integer jobId) {
        return service.getUsageCount(jobId);
    }

    @PostMapping("/set-password")
    public String setPassword(@RequestParam String username,
                              @RequestParam String password) {
        service.setPassword(username, password);
        return "Password set for " + username;
    }

    // Дополнительный эндпоинт для получения фото, если нужно
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Integer id) {
        Staff staff = service.findById(id);
        byte[] image = staff.getPhoto();
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // или PNG, в зависимости от формата
                .body(image);
    }
}