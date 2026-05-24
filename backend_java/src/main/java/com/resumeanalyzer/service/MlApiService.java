package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.MlRequestDTO;
import com.resumeanalyzer.dto.MlResponseDTO;
import com.resumeanalyzer.exception.ResumeProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ml.service.url}")
    private String mlApiUrl;

    public MlApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MlResponseDTO analyzeResume(String resumeText, String jobDescription) {
        MlRequestDTO request = MlRequestDTO.builder()
                .resumeText(resumeText)
                .jobDescription(jobDescription)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MlRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                mlApiUrl, HttpMethod.POST, entity, String.class
            );
            String body = response.getBody();
            System.out.println("Python response: " + body);
            return objectMapper.readValue(body, MlResponseDTO.class);
        } catch (Exception e) {
            throw new ResumeProcessingException("ML service error: " + e.getMessage());
        }
    }
}