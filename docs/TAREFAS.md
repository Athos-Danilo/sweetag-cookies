# 📋 Checklist de Tarefas - SweetAg Cookies

Este documento funciona como um guia de acompanhamento (To-Do List) para a implementação completa da plataforma **SweetAg Cookies**. Ele foi construído com base nas especificações técnicas, regras de negócio e arquitetura estabelecidas no projeto.

> [!IMPORTANT]
> A implementação deve seguir a arquitetura definida (FastAPI no Backend + Angular no Frontend) e respeitar as restrições e regras de negócio de controle de estoque e tempo de reserva. Foco em performance, segurança e uma UI/UX deslumbrante.

---

## 🗺️ Mapa de Progresso Geral

- [/] **Fase 1: Modelagem e Banco de Dados (PostgreSQL + SQLAlchemy)**
- [/] **Fase 2: Backend e APIs REST / WebSockets (FastAPI)**
- [/] **Fase 3: Frontend - Módulo do Cliente (Angular)**
- [/] **Fase 4: Frontend - Painel Administrativo (Angular)**
- [/] **Fase 5: Integrações, Segurança, Testes e Performance**
- [ ] **Fase 6: UI/UX & "Uau" Factor (Novo)**

---

## 🗄️ Fase 1: Modelagem e Banco de Dados
Mapeamento dos dados necessários no PostgreSQL via SQLAlchemy.

- [x] **M1.1: Modelo de Usuário (`User`)**
  - [x] WhatsApp como identificador único (RN07)
  - [x] Nome e aceitação de notificações
- [x] **M1.2: Modelo de Produtos e Sabores (`Product`)**
  - [x] Campos: ID, Nome temático, Descrição, Ingredientes, Tabela nutricional, Imagem URL, Preço, Quantidade em estoque, Disponibilidade, Ativo.
- [x] **M1.3: Modelo de Pedidos e Itens (`Order` & `OrderItem`)**
  - [x] Tabela `orders`: ID, ID Usuário, Status, Endereço, Data, Tipo de pagamento, Chave Pix, Expiração da reserva (30 min).
  - [x] Tabela `order_items`: ID, ID Pedido, Nome, Quantidade, Preço.
  - [x] Enum/Status de pedido dinâmicos.
- [x] **M1.4: Modelo de Calendário/Disponibilidade Futura (`Availability`)**
  - [x] Campos: ID, Data, ID Produto, Quantidade máxima de encomendas permitida.
- [x] **M1.5: Modelo de Campanha/Meta Financeira (`CampaignState`)**
  - [x] Campos: ID, Meta total (R$), Valor atual arrecadado (R$), Texto motivacional, Mostrar valores publicamente.
- [x] **M1.6: Modelo de Endereço (`Address`)**
  - [x] Campos detalhados para entrega interna (Bloco, Sala, etc).
- [x] **M1.7: Modelo de Chamados de Suporte (`SupportTicket`)**
  - [x] Campos de ticket, mensagem e relacionamento de usuário/pedido.
- [x] **M1.8: Otimização de Banco (Performance) 🚀**
  - [x] Criar Índices (Indexes) em campos muito buscados (ex: `orders.status`, `orders.created_at`, `user.whatsapp`).

---

## ⚡ Fase 2: Backend & APIs (FastAPI)
Lógica de negócios, endpoints REST e otimizações.

### 2.1 Módulo de Autenticação (`auth`)
- [x] Cadastro simplificado de cliente (WhatsApp e nome) (RF03)
- [x] Login persistente com JWT (RF04)
- [x] Gerador divertido de nomes automáticos de psicologia (RF05).
- [x] Dependência de autenticação de tokens para rotas.
- [x] Autenticação restrita para administradores e RBAC (Permissões).
- [x] Segurança Avançada: Implementar Rate Limiting (ex: `slowapi`) para evitar força bruta no login/cadastro.

### 2.2 Módulo de Endereços (`addresses`)
- [x] Endpoint `POST /api/addresses` e `GET /api/addresses`.

### 2.3 Módulo de Produtos (`products`)
- [/] Endpoints públicos (Cliente):
  - [x] `GET /api/products`: Lista todos os cookies ativos.
  - [x] `GET /api/products/{id}`: Retorna os detalhes de um cookie específico.
  - [x] Performance: Implementar cache (ex: Redis ou cache em memória) na listagem de produtos para respostas super rápidas.
- [/] Endpoints protegidos (Admin - CRUD completo) (RF19):
  - [x] Criar, editar, deletar logicamente cookies e ajuste de estoque rápido (RF20).

### 2.4 Módulo de Pedidos (`orders`) e Regras de Estoque
- [x] Endpoint `POST /api/orders`: Criação de pedido imediato.
  - [x] Validação de estoque garantido antes de reservar (RN01).
  - [x] Transação ACID segura contra venda dupla.
  - [x] Decremento do estoque físico e expiração de 30 min (RN03).
- [x] Endpoint `GET /api/orders`: Histórico de pedidos.
- [x] Tarefa em segundo plano (Background Task / Worker):
  - [x] Expiração automática de pedidos não pagos após 30 min, devolvendo estoque.
- [x] Endpoint `PATCH /api/orders/{id}/address`: Alteração de bloco/sala pós-compra (se status < PREPARACAO).

### 2.5 Módulo de Pagamento manual via Pix (`payments`)
- [/] Integração de pagamento manual:
  - [x] Geração e vinculação de código Pix Copia e Cola ao pedido.
  - [ ] Endpoint `POST /api/orders/{id}/pay`: Confirmação do usuário de que pagou.

### 2.6 Módulo de Agendamentos Futuros (`future-orders`)
- [x] Endpoints `POST /api/orders/schedule` e `GET /api/availability/calendar`.

### 2.7 Módulo Administrativo & Relatórios (`reports` / `admin-panel`)
- [/] Endpoints protegidos de gestão (status de pedidos, dashboard financeiro, campanhas).
- [/] Aprovação de comprovantes Pix e reservas:
  - [x] Aprovação manual de comprovantes Pix e integração com saldo da campanha (RN10).
  - [ ] Aprovação de reservas futuras (agendamentos).

### 2.8 WebSockets e Comunicação em Tempo Real (`websockets`)
- [x] Gerenciador de conexões no backend.
- [/] Push de atualizações para o cliente (Timeline) e para o painel de admin (Alerta de novo pedido).

### 2.9 Módulo de Suporte (`support`)
- [x] Endpoint `POST /api/support/tickets`.

### 2.10 Módulo de Favoritos (`favorites`) (Novo)
- [x] Endpoints para adicionar (`POST /api/favorites`), remover (`DELETE /api/favorites/{product_id}`) e listar (`GET /api/favorites`) cookies favoritos do usuário.

---

## 📱 Fase 3: Frontend - Módulo do Cliente (Angular)
Interface responsiva e dinâmica (Mobile-First) (RNF01, RNF02).

### 3.1 Autenticação e Configuração Inicial (`auth` & `core`)
- [/] Tela de Autenticação / Cadastro (`auth`):
  - [x] Campo WhatsApp com máscara.
  - [x] Campo Nome e Botão "Gerar Nome Psi Dinâmico".
  - [ ] Banner/Modal solicitando consentimento de notificações Push.
  - [ ] Vinculação e aceite de termos de privacidade e política de notificações no formulário de cadastro (RN08).
- [x] Guardas de rota e interceptadores JWT.
- [ ] Segurança: Migrar o armazenamento do token de LocalStorage para Cookies HTTP-Only (maior proteção contra XSS).

### 3.2 Catálogo Dinâmico e Campanha (`homepage`)
- [/] Vitrine de Cookies (`cookie-card`):
  - [x] Layout integrado à API real.
  - [x] Botão rápido de adicionar ao carrinho.
  - [ ] Badge visual "Esgotado".
- [ ] Barra de Progresso da Campanha (`progress-campaign`).
- [x] Rota/Modal de Detalhes do Cookie (`product-details`) - (Nota: exibe detalhes completos, mas falta mostrar quantidade restante em estoque e disponibilidade diária de acordo com o calendário).
- [ ] Performance: Otimização e Lazy Loading de imagens dos cookies. Implementar esqueletos de carregamento (Skeletons).

### 3.3 Carrinho de Compras e Checkout (`cart` / `checkout`)
- [x] Visualização do Carrinho (`cart`) e formulário de Checkout.
  - [x] Validação de estoque integrada ao backend.
- [x] Tela de Sucesso Premium: animações fluidas, agradecimento personalizado, instruções de pagamento PIX e Dinheiro com design iFood.
- [ ] Escolha de agendamento (Calendário) vs. Entrega imediata.

### 3.4 Pagamento e Timeline de Acompanhamento (`order-tracking`)
- [/] Tela de Pagamento Pix:
  - [x] Exibição de Pix Copia e Cola e Temporizador de 30 minutos.
  - [ ] Botão "Já Realizei o Pagamento" (informando ao backend/admin).
- [ ] Timeline Reativa via WebSockets.
- [ ] Permitir ao cliente editar o local de entrega pós-compra (enquanto o status for < PREPARACAO) (RN06).
- [x] Alinhamento do Stepper de status do frontend com os status cronológicos e etapas reais do backend (RF13).
- [x] Interface Premium na lista e detalhes de "Meus Pedidos" (Avatares, Títulos Psicológicos dinâmicos, Grid de Local de Entrega e animações em cascata).

### 3.5 Canal de Suporte (`support`)
- [x] Integração da tela de suporte (`SupportComponent`) com a API HTTP.

### 3.6 Módulo de Favoritos (`favorites`) (Novo)
- [x] Tela de favoritos integrada à API real (`FavoritesComponent`), permitindo visualizar e gerenciar cookies favoritos.

---

## 💻 Fase 4: Frontend - Painel Administrativo (Angular)
Interface responsiva otimizada para desktop.

### 4.1 a 4.4 Módulos do Painel
- [x] Login e Guardas de Rota.
- [/] Dashboard Executivo (Faturamento, Campanhas, Cookies mais vendidos):
  - [x] Visualização e gerenciamento da campanha financeira (progresso, metas e frases).
  - [ ] Tabela ou gráfico dos cookies mais vendidos (integrando a rota `/api/admin/reports/top-cookies`).
  - [ ] Relatórios e gráficos de faturamento financeiro diário/semanal/mensal (RF24).
- [x] Gestão de Pedidos com alertas sonoros em tempo real para novos pedidos e pagamentos.
- [ ] Gestão de Produtos (CRUD e Calendário).

---

## 🔒 Fase 5: Integrações, Segurança, Testes e Performance

### 5.1 Notificações e Canais
- [ ] Notificações Web Push via Service Worker.
- [ ] Mock de WhatsApp.

### 5.2 Segurança e Infraestrutura Global
- [ ] Configuração de CORS rigoroso e cabeçalhos de segurança (ex: Helmet equivalente no FastAPI).
- [ ] Gzip/Brotli habilitados no FastAPI para redução de payload.
- [ ] Sanitização robusta contra injeções de script no frontend e backend.

### 5.3 Testes Automatizados
- [/] Testes no backend (FastAPI):
  - [x] Scripts de banco, API e ordens (`test_db.py`, `test_api.py`, `test_orders.py`).
  - [x] Expiração de pedidos implementada.
  - [x] Testar cenários limites de concorrência massiva.
- [ ] Testes no frontend (Angular) (WebSockets e Componentes).

---

## ✨ Fase 6: UI/UX & "Uau" Factor (Estética e Experiência)
Tarefas adicionadas para tornar a aplicação incrivelmente bonita, fluida e cativante.

- [/] **Microinterações e Animações 🎨**: Adicionadas transições suaves (slide-up, fades), ícones com stroke animations (checkmark) e botões reativos.
- [/] **Glassmorphism e Sombras Modernas 🪞**: Refinado o design visual com sombras super suaves e modernas nos cards do painel e pedidos.
- [ ] **Feedback Visual Premium 💬**: Substituir os alertas padrões por Toast Notifications bonitos, não-intrusivos e animados (ex: ao adicionar no carrinho).
- [ ] **Dark Mode (Tema Escuro) 🌙**: Oferecer chaveador de tema elegante com paleta noturna adaptada para a identidade da marca.
- [ ] **State Feedback (Carregamento Mágico) ⏳**: Implementar *Skeleton loaders* (estruturas de carregamento animadas) no lugar de telas vazias.

---

## 🚀 Ideias e Sugestões de Evolução (Features Futuras)
Recursos adicionais sugeridos para aumentar o engajamento e as vendas, aproveitando a temática única de psicologia e bem-estar.

- [ ] **Sistema de Avaliações Terapêuticas (NPS)**: Após receber o pedido, o usuário avalia sua "Sessão Terapêutica" de 1 a 5 estrelas e pode deixar um depoimento sobre como os cookies melhoraram seu dia.
- [ ] **Programa de Fidelidade (Cartão SUS - Sistema Único de Sabores)**: A cada 10 compras realizadas, o cliente ganha 1 "Consulta de Retorno" grátis (1 cookie). O backend acumula os pontos automaticamente.
- [ ] **Cupons de Desconto e Indicação**: Permitir cupons temáticos (Ex: `TERAPIA10` para 10% de desconto) e links de indicação para o usuário mandar para um amigo que está estressado.
- [ ] **Compartilhamento Social Automático**: Ao concluir um pedido, exibir um botão "Compartilhar Receita Médica" que gera uma imagem divertida para o Stories do Instagram ("A farmácia acaba de liberar minha dose de dopamina da Sweetag!").
- [ ] **Observações Terapêuticas**: Campo livre no checkout para o cliente enviar uma nota para o atendente (Ex: "Mandar um bilhetinho motivacional junto!" ou "Entregar sem fazer barulho").
