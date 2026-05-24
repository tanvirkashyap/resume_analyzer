package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.MlResponseDTO;
import com.resumeanalyzer.dto.ResumeResponseDTO;
import com.resumeanalyzer.exception.ResumeProcessingException;
import com.resumeanalyzer.util.FileValidator;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {

    private final PdfService pdfService;
    private final MlApiService mlApiService;

    public ResumeService(PdfService pdfService, MlApiService mlApiService) {
        this.pdfService = pdfService;
        this.mlApiService = mlApiService;
    }

    public ResumeResponseDTO analyzeResume(MultipartFile file, String jobDescription) {
        FileValidator.validate(file);

        String resumeText = pdfService.extractText(file);
        System.out.println("Extracted text: " + resumeText.substring(0, Math.min(200, resumeText.length())));

        MlResponseDTO mlResponse = mlApiService.analyzeResume(resumeText, jobDescription);

        if (mlResponse == null) {
            throw new ResumeProcessingException("Empty response from ML service");
        }

        return ResumeResponseDTO.builder()
                .score(mlResponse.getScore())
                .skills(mlResponse.getSkills())
                .suggestions(mlResponse.getSuggestions())
                .build();
    }
}