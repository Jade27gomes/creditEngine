package com.srm.creditengine.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CurrencyResponseDTO {
    private Long id;
    private String code;
    private String name;
}