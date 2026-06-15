package com.srm.creditengine.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeRateRequestDTO {
    
    @NotBlank(message = "Moeda de origem é obrigatória")
    @Size(min = 3, max = 3, message = "Código da moeda deve ter 3 caracteres (ex: USD)")
    private String fromCurrencyCode;

    @NotBlank(message = "Moeda de destino é obrigatória")
    @Size(min = 3, max = 3, message = "Código da moeda deve ter 3 caracteres (ex: BRL)")
    private String toCurrencyCode;

    @NotNull(message = "A taxa de câmbio é obrigatória")
    @DecimalMin(value = "0.000001", message = "A taxa deve ser maior que zero")
    private BigDecimal rate;
}