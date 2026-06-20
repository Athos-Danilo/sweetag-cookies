# Plano de Implementação de Notificações (WebSockets + VAPID Web Push)

Este documento detalha o plano passo a passo para construir um sistema completo de notificações para o **SweetAg Cookies**. O sistema utilizará duas abordagens complementares:
1. **WebSockets:** Para notificações em tempo real, rápidas e sem dependência do sistema operacional (quando o usuário estiver com o app aberto).
2. **VAPID Web Push:** Para notificações em segundo plano, alertando o usuário mesmo quando o navegador ou aba estiverem fechados.

---

## Observações Importantes (Apple / iOS)

> [!WARNING]
> A Apple impõe restrições rígidas para Web Push no iOS. Para que as notificações VAPID funcionem em iPhones/iPads:
> 1. O usuário **precisa** adicionar o site à Tela de Início ("Add to Home Screen" - PWA).
> 2. Somente a partir dessa versão instalada na tela de início é que o sistema iOS permitirá a requisição de notificações.
> 3. O usuário precisa interagir com a tela (clicar num botão) para disparar a requisição.

---

## Fase 1: Estrutura Base e Banco de Dados (Backend)

O primeiro passo é preparar o backend para saber quem está conectado e onde enviar os sinais de rádio (push).

### 1.1 Gerar as Chaves VAPID
- Usar a biblioteca `pywebpush` ou um gerador online seguro para criar o par de chaves (Public Key e Private Key).
- Adicionar essas chaves ao arquivo `.env` do backend e mapear na classe de configurações (Settings).

### 1.2 Atualização do Banco de Dados
- Criar a tabela ou atualizar o modelo `User` para suportar as inscrições VAPID.
- Precisaremos salvar três informações para cada aparelho do usuário: `endpoint` (URL do navegador), `p256dh` (chave pública do navegador) e `auth` (segredo de autenticação).
- **Decisão de Arquitetura:** O ideal é criar um modelo separado `PushSubscription` relacionado ao `User` (1-para-N), pois o usuário pode autorizar notificações no celular e também no PC.

### 1.3 Estruturar Dependências
- Adicionar as bibliotecas Python necessárias (`pywebpush`, etc.) no `requirements.txt`.

---

## Fase 2: Implementação de WebSockets (In-App)

Esta fase cuidará das notificações instantâneas com o app aberto.

### 2.1 Connection Manager no Backend
- Criar a classe de gerenciamento dentro de `backend/app/websockets/manager.py`.
- Essa classe vai mapear `user_id` para uma conexão WebSocket ativa.
- Implementar métodos como `connect()`, `disconnect()` e `send_personal_message()`.

### 2.2 Rota WebSocket
- Criar o endpoint `ws://localhost:8000/ws/notifications/{user_id}` para aceitar a conexão do Angular e validar o token de autenticação.

### 2.3 Serviço no Frontend (Angular)
- Criar o `NotificationService` no Angular para abrir a conexão WebSocket automaticamente quando o usuário fizer login.
- Adicionar um mecanismo de reconexão automática caso a internet caia.
- Criar um componente simples de Toast/Snackbar para mostrar visualmente a mensagem (ex: "Seu cookie saiu para entrega!").

---

## Fase 3: Web Push com VAPID (Background)

Esta fase é o "peso pesado", responsável por integrar o Service Worker do navegador.

### 3.1 Instalar o PWA no Angular
- Rodar o comando `ng add @angular/pwa` para configurar o `manifest.webmanifest` e injetar o Service Worker básico no app.
- Configurar a chave pública VAPID no `environment.ts`.

### 3.2 Lógica de Inscrição (Frontend)
- Na tela de perfil, quando o usuário ligar a chavinha de "Aceita Notificações", disparar o pedido de permissão do navegador (`Notification.requestPermission()`).
- Usar a biblioteca nativa do Angular `SwPush` para gerar a inscrição (`requestSubscription`).
- Enviar o objeto de inscrição gerado via HTTP POST para o nosso backend salvar.

### 3.3 Rotas e Lógica de Envio (Backend)
- Criar a rota `POST /api/notifications/subscribe` para salvar os dados VAPID vinculados ao usuário.
- Criar a função central de disparo: `notify_user_order_update()`.
- Lógica de disparo:
  1. Tentar enviar via WebSocket primeiro (se ele estiver online).
  2. Independentemente disso (ou em fallback), buscar as assinaturas no banco e enviar um disparo VAPID via `pywebpush`.

---

## Fase 4: Acabamento, Service Worker e UX

### 4.1 Tratamento do Push no Service Worker
- Customizar o arquivo `ngsw-worker.js` (ou criar um custom worker se necessário) para formatar a notificação.
- Adicionar o ícone do projeto (logo do SweetAg Cookies) na notificação.
- Definir ações (botões na notificação) e o que acontece ao clicar (ex: abrir a tela de "Acompanhar Pedido").

### 4.2 Tratamento de Erros VAPID
- Adicionar lógica no backend para deletar subscrições inválidas (caso o usuário revogue a permissão nas configurações do celular, o provedor do navegador retornará erro `410 Gone`).

### 4.3 Experiência iOS (PWA)
- Implementar um banner ou instrução específica no frontend detectando se é Safari (iOS) sugerindo: *"Para receber notificações, adicione este site à Tela de Início"*.
