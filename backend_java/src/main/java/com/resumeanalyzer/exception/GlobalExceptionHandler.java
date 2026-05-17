@ExceptionHandler(ResumeProcessingException.class)
public ResponseEntity<?> handleResumeException(ResumeProcessingException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("error", ex.getMessage()));
}

@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleGenericException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "An unexpected error occurred"));
}