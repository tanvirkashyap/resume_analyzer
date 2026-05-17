package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ResumeResponseDTO;
import com.resumeanalyzer.exception.ResumeProcessingException;
import com.resumeanalyzer.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ResumeResponseDTO> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String jobDescription
    ) {
        ResumeResponseDTO response = resumeService.analyzeResume(
                file,
                jobDescription
        );
        return ResponseEntity.ok(response);
    }
}