package com.resumeanalyzer.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlResponseDTO {

    private Integer score;

    private List<String> skills;

    private List<String> missing_skills;

    private List<String> suggestions;
}