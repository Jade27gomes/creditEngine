
-- 1. Moedas
CREATE TABLE currencies (
    id   BIGSERIAL    PRIMARY KEY,
    code VARCHAR(3)   NOT NULL UNIQUE, -- ex: BRL, USD
    name VARCHAR(50)  NOT NULL
);

-- 2. Produtos 
CREATE TABLE products (
    id     BIGSERIAL     PRIMARY KEY,
    name   VARCHAR(100)  NOT NULL UNIQUE,
    spread NUMERIC(5, 4) NOT NULL        
);

-- 3. Cedentes 
CREATE TABLE assignors (
    id       BIGSERIAL    PRIMARY KEY,
    name     VARCHAR(150) NOT NULL,
    document VARCHAR(18)  NOT NULL UNIQUE  
);

-- 4. Taxas de Câmbio
CREATE TABLE exchange_rates (
    id               BIGSERIAL      PRIMARY KEY,
    from_currency_id BIGINT         NOT NULL REFERENCES currencies(id),
    to_currency_id   BIGINT         NOT NULL REFERENCES currencies(id),
    rate             NUMERIC(19, 6) NOT NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- 5. Recebíveis
CREATE TABLE receivables (
    id          BIGSERIAL      PRIMARY KEY,
    assignor_id BIGINT         NOT NULL REFERENCES assignors(id),
    product_id  BIGINT         NOT NULL REFERENCES products(id),
    currency_id BIGINT         NOT NULL REFERENCES currencies(id),
    face_value  NUMERIC(19, 6) NOT NULL,
    due_date    DATE           NOT NULL,
    term_months INTEGER        NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'PENDING', -- PENDING, LIQUIDATED, CANCELLED
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- 6. Transações (Liquidação e Auditoria)
CREATE TABLE transactions (
    id                  BIGSERIAL      PRIMARY KEY,
    receivable_id       BIGINT         NOT NULL UNIQUE REFERENCES receivables(id),
    payment_currency_id BIGINT         NOT NULL REFERENCES currencies(id),
    present_value       NUMERIC(19, 6) NOT NULL, -- Valor pago
    discount            NUMERIC(19, 6) NOT NULL, -- Valor do lucro (deságio)
    exchange_rate_used  NUMERIC(19, 6),          -- Taxa no momento da liquidação
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    version             BIGINT         NOT NULL DEFAULT 0 
);

-- =============================================================
-- Índices
-- =============================================================

CREATE INDEX idx_receivables_assignor ON receivables(assignor_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);

-- =============================================================
-- Seed 
-- =============================================================

INSERT INTO currencies (code, name) VALUES ('BRL', 'Real Brasileiro'), ('USD', 'Dólar Americano');
INSERT INTO products (name, spread) VALUES ('Duplicata Mercantil', 0.0150), ('Cheque Pré-datado', 0.0250);