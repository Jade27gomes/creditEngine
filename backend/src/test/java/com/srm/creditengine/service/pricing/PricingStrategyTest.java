package com.srm.creditengine.service.pricing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testa as strategies isoladamente, sem Spring context.
 * Valida a fórmula: VP = FaceValue / (1 + baseRate + spread) ^ termMonths
 */
class PricingStrategyTest {

    private final DuplicataMercantilStrategy duplicata = new DuplicataMercantilStrategy();
    private final ChequePreDatadoStrategy    cheque    = new ChequePreDatadoStrategy();

    @Test
    @DisplayName("Duplicata Mercantil: VP calculado corretamente com spread 1.5% a.m.")
    void duplicata_calculatesCorrectPresentValue() {
        // FV=1000, prazo=3 meses, baseRate=0, spread=0.015
        // VP = 1000 / (1.015)^3 = 1000 / 1.045678... ≈ 956.317...
        BigDecimal faceValue  = new BigDecimal("1000.00");
        BigDecimal baseRate   = BigDecimal.ZERO;
        BigDecimal spread     = new BigDecimal("0.0150");

        BigDecimal result = duplicata.calculate(faceValue, 3, baseRate, spread);

        assertThat(result.setScale(2, RoundingMode.HALF_EVEN))
                .isEqualByComparingTo(new BigDecimal("956.32"));
    }

    @Test
    @DisplayName("Cheque Pré-datado: VP calculado corretamente com spread 2.5% a.m.")
    void cheque_calculatesCorrectPresentValue() {
        // FV=1000, prazo=3 meses, baseRate=0, spread=0.025
        // VP = 1000 / (1.025)^3 = 1000 / 1.076890... ≈ 928.599...
        BigDecimal faceValue  = new BigDecimal("1000.00");
        BigDecimal baseRate   = BigDecimal.ZERO;
        BigDecimal spread     = new BigDecimal("0.0250");

        BigDecimal result = cheque.calculate(faceValue, 3, baseRate, spread);

        assertThat(result.setScale(2, RoundingMode.HALF_EVEN))
                .isEqualByComparingTo(new BigDecimal("928.60"));
    }

    @Test
    @DisplayName("Prazo 1 mês: VP deve ser ligeiramente abaixo do face value")
    void singleMonth_presentValueBelowFaceValue() {
        BigDecimal faceValue = new BigDecimal("5000.00");
        BigDecimal result    = duplicata.calculate(faceValue, 1, BigDecimal.ZERO, new BigDecimal("0.0150"));

        assertThat(result).isLessThan(faceValue);
    }

    @Test
    @DisplayName("Nomes dos produtos coincidem com o seed do banco")
    void productNames_matchDatabaseSeed() {
        assertThat(duplicata.getProductName()).isEqualTo("Duplicata Mercantil");
        assertThat(cheque.getProductName()).isEqualTo("Cheque Pré-datado");
    }
}
