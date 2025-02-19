package dev.dxheroes.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import dev.dxheroes.dto.Error;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Error> handleResponseStatusException(
            ResponseStatusException ex, 
            HttpServletRequest request) {
        Error errorResponse = new Error(
            ex.getStatus().value(),
            "[" + request.getRequestURI() + "] " + ex.getReason()
        );

        return ResponseEntity.status(ex.getStatus()).body(errorResponse);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Error> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        Error errorResponse = new Error(
            HttpStatus.BAD_REQUEST.value(),
            "Invalid JSON format: " + e.getMessage()
        );
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Error> handleValidationExceptions(MethodArgumentNotValidException e) {
        var firstError = e.getBindingResult().getFieldErrors().get(0);
        Error errorResponse = new Error(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed for field '" + firstError.getField() + "': " + firstError.getDefaultMessage()
        );
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Error> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        Error errorResponse = new Error(
            HttpStatus.BAD_REQUEST.value(),
            "[" + request.getRequestURI() + "] Invalid request: " + ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Error> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        
        // Determine if this is a "not found" scenario
        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        }
        
        Error errorResponse = new Error(
            status.value(),
            "[" + request.getRequestURI() + "] " + ex.getMessage()
        );
        return ResponseEntity.status(status).body(errorResponse);
    }
}
