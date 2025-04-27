package com.example.PrisonManagement.Exception.TypeException;


public class ValidationRequiredException extends RuntimeException {
    public ValidationRequiredException(String message) {
        super(message);
    }
}