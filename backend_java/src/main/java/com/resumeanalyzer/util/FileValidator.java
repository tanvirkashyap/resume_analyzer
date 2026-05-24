package com.resumeanalyzer.util;

import com.resumeanalyzer.exception.ResumeProcessingException;
import org.springframework.web.multipart.MultipartFile;

public class FileValidator {

    public static void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResumeProcessingException("File is empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new ResumeProcessingException("Only PDF files are allowed");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ResumeProcessingException("Invalid file type");
        }
    }
}