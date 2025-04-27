package com.example.PrisonManagement.Exception.Handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RestControllerAdvice
public class GlobalExceptionHandler {
    private final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleValidation(MethodArgumentNotValidException ex) {
        String message = Optional.ofNullable(ex.getBindingResult().getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElse("Validation failed");

        logger.error("Validation error: {}", message, ex);
        return new ResponseError(message, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(ResponseStatusException.class)
    protected ResponseEntity<ResponseError> handleResponseStatus(ResponseStatusException ex) {
        logger.error("Service error: {} {}", ex.getStatusCode(), ex.getReason(), ex);
        ResponseError error = new ResponseError(ex.getReason(), (HttpStatus) ex.getStatusCode());
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    // 3) «ловушка» на всё остальное (500)
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ResponseError> handleAny(Exception ex) {
        logger.error("Unexpected error", ex);
        ResponseError error = new ResponseError("Внутренняя ошибка сервера", HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
