package com.srm.creditengine.service.pricing;

import org.springframework.stereotype.Component;

/**
 * Spread de 1.5% a.m. — definido na tabela products (não hardcoded aqui).
 * A strategy recebe o spread como parâmetro, mantendo-a agnóstica ao valor.
 */
@Component
public class DuplicataMercantilStrategy extends AbstractPresentValueStrategy {

    @Override
    public String getProductName() {
        return "Duplicata Mercantil";
    }
}
