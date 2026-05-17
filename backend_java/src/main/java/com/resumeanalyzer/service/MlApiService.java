package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.MlRequestDTO;
import com.resumeanalyzer.dto.MlResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class MlApiService {

    private final RestTemplate restTemplate;

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
    ResponseEntity<MlResponseDTO> response = restTemplate.exchange(
        mlApiUrl, HttpMethod.POST, entity, MlResponseDTO.class
    );
    return response.getBody();
} catch (RestClientException e) {
    throw new ResumeProcessingException("ML service unavailable: " + e.getMessage());
}
        return response.getBody();
    }
}