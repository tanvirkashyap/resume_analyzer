package com.resumeanalyzer.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlRequestDTO {

    private String resumeText;
    private String jobDescription;
}