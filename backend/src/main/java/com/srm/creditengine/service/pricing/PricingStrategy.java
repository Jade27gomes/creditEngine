package com.srm.creditengine.service.pricing;

import java.math.BigDecimal;

/**
 * Strategy Pattern — cada produto (Duplicata, Cheque etc.) implementa
 * sua própria variação de risco, mas compartilham a mesma fórmula base.
 *
 * Fórmula: VP = Valor Face / (1 + taxaBase + spread) ^ prazoMeses
 */
public interface PricingStrategy {

    BigDecimal calculate(BigDecimal faceValue, int termMonths, BigDecimal baseRate, BigDecimal spread);

    /**
     * Nome do produto — usado pela factory para resolver a strategy correta.
     * Deve corresponder exatamente ao campo `name` da tabela `products`.
     */
    String getProductName();
}
