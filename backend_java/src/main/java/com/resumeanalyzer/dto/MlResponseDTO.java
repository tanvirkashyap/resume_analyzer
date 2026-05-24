package com.resumeanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MlResponseDTO {

    @JsonProperty("score")
    private Integer score;

    @JsonProperty("skills")
    private List<String> skills;

    @JsonProperty("missing_skills")
    private List<String> missingSkills;

    @JsonProperty("suggestions")
    private List<String> suggestions;
}