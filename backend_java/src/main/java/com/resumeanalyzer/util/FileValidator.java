package com.resumeanalyzer.util;

import org.springframework.web.multipart.MultipartFile;

public class FileValidator {

    public static void validate(MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || !filename.endsWith(".pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }
}