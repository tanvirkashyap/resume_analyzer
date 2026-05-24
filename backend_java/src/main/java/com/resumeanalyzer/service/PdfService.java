package com.resumeanalyzer.service;

import com.resumeanalyzer.exception.ResumeProcessingException;
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
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            // Clean the text - remove special chars, normalize whitespace
            text = text.replaceAll("[^a-zA-Z0-9\\s+#.]", " ");
            text = text.replaceAll("\\s+", " ").trim();
            System.out.println("Cleaned extracted text: " + text.substring(0, Math.min(300, text.length())));
            return text;
        } catch (IOException e) {
            throw new ResumeProcessingException("Failed to parse PDF: " + e.getMessage());
        }
    }
}