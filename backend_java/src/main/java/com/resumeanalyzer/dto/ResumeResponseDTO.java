package com.resumeanalyzer.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponseDTO {

    private Integer score;

    private List<String> skills;

    private List<String> suggestions;
}