package com.resumeanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlRequestDTO {

    @JsonProperty("resumeText")
    private String resumeText;

    @JsonProperty("jobDescription")
    private String jobDescription;
}