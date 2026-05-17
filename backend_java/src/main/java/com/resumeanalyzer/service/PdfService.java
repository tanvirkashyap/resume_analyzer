package com.resumeanalyzer.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfService {

    public String extractText(MultipartFile file) {
    try (PDDocument document = PDDocument.load(file.getInputStream())) {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setSortByPosition(true); // fixes column/layout issues
        String text = stripper.getText(document);
        return text.replaceAll("\\s+", " ").trim(); // normalize whitespace
    } catch (IOException e) {
        throw new ResumeProcessingException("Failed to parse PDF: " + e.getMessage());
    }
}
}