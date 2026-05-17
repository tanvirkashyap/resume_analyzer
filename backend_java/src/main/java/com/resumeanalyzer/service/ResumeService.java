package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.MlResponseDTO;
import com.resumeanalyzer.dto.ResumeResponseDTO;
import com.resumeanalyzer.entity.ResumeAnalysis;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.util.FileValidator;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class ResumeService {

    private final PdfService pdfService;
    private final MlApiService mlApiService;
    private final ResumeRepository resumeRepository;

    public ResumeService(
            PdfService pdfService,
            MlApiService mlApiService,
            ResumeRepository resumeRepository
    ) {
        this.pdfService = pdfService;
        this.mlApiService = mlApiService;
        this.resumeRepository = resumeRepository;
    }

    public ResumeResponseDTO analyzeResume(
            MultipartFile file,
            String jobDescription
    ) {
        MlResponseDTO mlResponse = mlApiService.analyzeResume(resumeText, jobDescription);
        if (mlResponse == null) {
    throw new ResumeProcessingException("Empty response from ML service");
}
        FileValidator.validate(file);

}