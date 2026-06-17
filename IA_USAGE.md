# AI_USAGE.md

> **Documentação de Uso de Inteligência Artificial**  
> SRM Credit Engine · Jade Gomes · Desafio Técnico SRM 2026

---

## Contexto e Postura Adotada

Este documento descreve de forma transparente como modelos de linguagem de grande escala (LLMs) foram utilizados como ferramentas auxiliares no desenvolvimento do SRM Credit Engine, em conformidade com as diretrizes do desafio técnico que permitem o uso de IA com documentação adequada.

Cada resposta da IA passou por avaliação crítica antes de ser aceita, adaptada ou descartada. O juízo técnico exercido ao rejeitar sugestões inadequadas foi tão importante quanto aceitar as úteis — e é documentado aqui com a mesma transparência.

---

## Ferramentas Utilizadas

| Ferramenta | Finalidade Principal |
|------------|---------------------|
| Claude (Anthropic) | Geração e revisão de código Java/Spring Boot, debugging de lógica de negócio, revisão de arquitetura |
| ChatGPT (OpenAI) | Consultas pontuais sobre APIs externas (PTAX Bacen), dúvidas de TypeScript |
| GitHub Copilot | Autocomplete em boilerplate (DTOs, getters/setters, imports) |

---

## Como a IA Foi Utilizada

### Onde a IA contribuiu positivamente

**1. Scaffolding inicial do projeto Spring Boot**

A estrutura de pacotes (`controller`, `service`, `repository`, `model`, `dto`, `exception`) foi gerada com auxílio de IA como ponto de partida. O código foi revisado integralmente antes de ser aceito — nomes de classes, convenções de pacote e organização da árvore de diretórios foram ajustados para refletir as convenções do time e do desafio.

**2. Implementação do padrão Strategy**

A IA foi útil para gerar o esqueleto da interface `PricingStrategy` e as implementações iniciais de `DuplicataMercantilStrategy` e `ChequePreDatadoStrategy`. A fórmula matemática de valor presente (`VP = VF / (1 + r)^n`) e a escolha de `BigDecimal` com `RoundingMode.HALF_EVEN` foram decisões técnicas próprias, validadas contra a documentação do desafio.

**3. Configuração do RestClient (Spring Boot 3)**

A migração de `RestTemplate` para `RestClient` foi sugerida pela IA após identificar que `RestTemplate` estava sendo instanciado diretamente (sem injeção de dependência). A sugestão foi correta e alinhada com as práticas do Spring Boot 3 — foi aceita e implementada.

**4. Testes unitários com JUnit 5 + AssertJ**

Os 6 casos de teste em `PricingStrategyTest` foram desenvolvidos com auxílio da IA para estruturar os casos de borda (prazo zero, spread diferente, conversão cross-currency). A lógica de asserção foi revisada manualmente para garantir que os valores esperados estavam matematicamente corretos.

**5. SQL nativo no módulo de extrato**

A query nativa do `StatementRepository` com filtros dinâmicos e paginação foi refinada com auxílio de IA para eliminar N+1 e garantir que os índices estavam sendo usados corretamente. O entendimento da query — incluindo os JOINs, os filtros condicionais e a projeção — é completo.

**6. Configuração do Docker Compose**

A configuração de `depends_on` com `healthcheck` para garantir que o backend só sobe após o PostgreSQL estar saudável foi sugerida pela IA. A lógica foi entendida e validada antes de ser integrada.

---

##  Onde a IA Atrapalhava — Decisões de Rejeição

Esta seção documenta os momentos em que as sugestões da IA foram identificadas como inadequadas e rejeitadas. Isso representa o exercício de autonomia técnica crítico em qualquer uso responsável de LLMs.

---

### Caso 1: Substituição do Tailwind v3 por "builder de configuração"

**O que a IA sugeriu:** Substituir o `tailwind.config.js` padrão do Vite por uma configuração com um builder customizado que "melhoraria a integração".

**Por que foi rejeitado:** A configuração padrão do Vite + Tailwind v3 é suficiente para o projeto e amplamente documentada. O "builder" sugerido não existia como dependência oficial — era uma alucinação da IA apresentada como melhoria técnica. Aceitar essa sugestão teria introduzido uma dependência falsa e quebrado o build.

**Decisão:** Manter `tailwind.config.js` padrão, sem alterações.

---

### Caso 2: Duplicação da estrutura de pastas do frontend

**O que a IA sugeriu:** Em determinado momento de debugging, a IA gerou código que criava uma segunda pasta `src/components/` dentro de `src/components/` — efetivamente duplicando a estrutura de diretórios.

**Como foi identificado:** A inconsistência nos caminhos de import (`../../components/` vs `../components/`) foi detectada antes de executar o código.

**Decisão:** Descartar o bloco de código gerado e resolver o bug original manualmente, revisando os imports um a um.

---

### Caso 3: Proposta de "foguete" — over-engineering no frontend

**O que a IA sugeriu:** Adicionar Redux Toolkit, React Query, Zustand e uma camada de cache client-side para gerenciar o estado do painel.

**Por que foi rejeitado:** O estado da aplicação cabe em `useState` propagado via props a partir do `App.tsx`. A complexidade do Redux não se justifica para o escopo do desafio. Adicionar essas dependências aumentaria o bundle, a curva de aprendizado e o tempo de desenvolvimento sem nenhum ganho funcional real.

**Decisão:** Manter `useState` + prop drilling intencional no root. Simples, legível, correto para o escopo.

---

### Caso 4: Alucinação de endpoints da API PTAX Bacen

**O que a IA sugeriu:** A URL de consulta da PTAX Bacen construída pela IA tinha parâmetros inexistentes (`&moeda=USD&tipo=D` em combinação incorreta) que retornavam erro 400 na API real.

**Como foi identificado:** Testando manualmente o endpoint do Bacen antes de integrar. A resposta da API real foi analisada diretamente na documentação oficial do Banco Central.

**Decisão:** Construir a URL de consulta manualmente com base na documentação oficial do PTAX (`https://olinda.bcb.gov.br/olinda/servico/PTAX`), ignorando a sugestão da IA.

---

### Caso 5: Mapeamento de campos DTOs invertido no frontend

**O que a IA sugeriu:** Em uma sessão de debugging do frontend, a IA mapeou `faceValue` como `value` e `currencyCode` como `currency` para corresponder ao backend — mas as chaves estavam trocadas em relação ao contrato real do Swagger.

**Como foi identificado:** Consultando o Swagger UI (`http://localhost:8080/swagger-ui.html`) diretamente e comparando com o código gerado.

**Decisão:** Sempre validar mapeamentos de DTO contra o Swagger antes de aceitar qualquer código de integração gerado por IA.

---

## Lições do Processo

**1. A IA é uma ferramenta de velocidade, não de autoridade técnica.**
Gerar boilerplate mais rápido é valioso. Delegar decisões de arquitetura sem revisão é perigoso.

**2. Alucinações são mais frequentes em integrações com APIs externas.**
A IA não tem como saber a versão exata de uma API externa que mudou depois do seu corte de treinamento. Sempre validar contra a documentação oficial.

**3. Debugging guiado por IA requer atenção redobrada.**
Em situações de debugging, a IA tende a propor soluções que "soam certas" mas que mudam mais do que o necessário — às vezes introduzindo novos bugs. A regra foi: entender o bug primeiro, depois pedir sugestão.

**4. Over-engineering é o bias padrão dos LLMs.**
Os modelos tendem a sugerir a solução mais completa e sofisticada, não a mais adequada para o contexto. Exercer julgamento sobre o escopo foi uma habilidade constante.

**5. O aprendizado real veio da fricção, não da assistência.**
O frontend foi a parte mais desafiadora — sou desenvolvedora backend com contato limitado com React. Os momentos de maior aprendizado foram exatamente os que exigiram entender o porquê de um bug antes de pedir ajuda à IA, não os que a IA resolveu automaticamente.


## Conclusão

O uso de IA neste projeto foi transparente, crítico e documentado. A entrega final reflete compreensão técnica genuína das escolhas arquiteturais, das fórmulas financeiras implementadas e dos trade-offs feitos — não uma coleção de código aceito sem revisão.

A principal competência exercida não foi "usar IA", mas **saber quando não usar** — e isso está documentado neste arquivo.

---

*Jade Gomes · SRM Credit Engine · Junho 2026*