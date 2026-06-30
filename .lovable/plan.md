# Plano: Auth unificada + Dashboard do usuário + Atendimento (chat realtime)

Mantém toda a estrutura atual (rotas públicas, painel admin, e-commerce, banco). Só adiciona o que foi pedido.

## 1. Banco de dados (1 migração)

Novas tabelas em `public`:

- `profiles` — `id (uuid, FK auth.users, PK)`, `full_name`, `email`, `created_at`, `updated_at`. Trigger `on_auth_user_created` cria o profile + insere `role='user'` em `user_roles` automaticamente.
- `support_tickets` — `id`, `user_id (FK auth.users)`, `status ('open'|'in_progress'|'closed')`, `last_message_at`, `closed_by`, `created_at`, `closed_at`.
- `support_messages` — `id`, `ticket_id (FK)`, `sender_id`, `sender_role ('user'|'admin')`, `message`, `read_by_user`, `read_by_admin`, `created_at`.

GRANTs para `authenticated` + `service_role`. RLS:
- `profiles`: user lê/atualiza o próprio; admin lê todos (`has_role`).
- `support_tickets`: user vê/cria os próprios; admin vê/atualiza todos.
- `support_messages`: user vê/insere mensagens dos próprios tickets abertos; admin vê/insere em qualquer ticket aberto. Insert bloqueado se ticket `closed`.

Habilitar Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE support_messages, support_tickets`.

Manter `user_roles` existente. Admin atual (`dukamp8442@dukamp.local`) continua intacto.

## 2. Autenticação unificada

Substituir `src/routes/auth.tsx` por tela com abas **Entrar** / **Criar conta**.

Tela de registro:
- Nome completo, e-mail, senha, confirmar senha.
- Desafio matemático (2 números aleatórios 1-9, operação `+`) gerado no client, validado antes do `signUp`.
- `supabase.auth.signUp` com `emailRedirectTo: window.location.origin` e `data: { full_name }`.

Após login (em `auth.tsx` e `AuthProvider`):
- Se `isAdmin` → `/admin`.
- Senão → `/dashboard`.

`auth.tsx` deixa de ser "exclusivo admin" — copy atualizada para "Entrar ou criar conta".

`supabase--configure_auth` com `auto_confirm_email: true` para não travar registro em dev (sem signup disable).

## 3. Dashboard do usuário

Nova rota `src/routes/dashboard.tsx` (gated client-side por `useAuth`, redireciona admin para `/admin` e não-logado para `/auth`).

Layout reaproveitando `SiteLayout`/tokens existentes, com 3 cards:
- **Meu Carrinho** → link para `/carrinho` (usa `CartProvider` existente; lista itens atuais).
- **Histórico de Compras** → tabela mock vazia + texto "Em breve".
- **Atendimento** → botão "Iniciar atendimento" (abre o chat widget).

## 4. Sistema de atendimento (chat realtime)

### Componentes novos (`src/components/support/`)

- `SupportChatProvider.tsx` — contexto global montado no `__root.tsx` (dentro de `AuthProvider`):
  - Para user logado não-admin: busca/cria ticket aberto, mantém `messages`, assina realtime em `support_messages` e `support_tickets` filtrando por `ticket_id`.
  - Estado: `open` (janela aberta), `minimized`. Persistido em `localStorage` (`dukamp_chat_open`) para sobreviver a refresh/login — o ticket em si vem do banco, então o usuário "continua de onde parou" naturalmente.
  - Expõe: `ticket`, `messages`, `sendMessage`, `closeTicket`, `openChat`, `minimize`, `unreadCount`.

- `ChatWindow.tsx` — janela flutuante (bottom-right ou bottom-left, fixed) com header (status + minimizar + fechar), lista de mensagens, input. Input desabilitado se `status==='closed'`. Botão "Encerrar atendimento".

- `ChatLauncher.tsx` — botão flutuante bottom-left com badge de não-lidas. Sempre visível quando há ticket ativo e janela fechada/minimizada. Não renderiza para admin nem em rotas `/admin/*` (admin usa a área dedicada).

Montagem: adicionar `<SupportChatProvider>` + `<ChatLauncher/>` no `__root.tsx` para que o widget esteja em todo o site público.

### Painel admin — `/admin/atendimentos`

Nova rota `src/routes/admin.atendimentos.tsx`:
- Lista de tickets (query Supabase + realtime subscribe).
- Ordenação: não respondidos primeiro, depois por `last_message_at` desc.
- Badge de status colorido (Não respondido / Em atendimento / Finalizado).
- Busca por nome/e-mail do usuário (join com `profiles`).
- Contador de mensagens não lidas por ticket (`read_by_admin = false`).
- Múltiplos atendimentos abertos: state local `openTicketIds: Set<string>` renderizando vários `AdminChatPanel` lado-a-lado (tabs/cards).
- Ao admin enviar primeira resposta, trigger SQL muda status `open → in_progress` (ou update explícito no insert).
- Botão "Encerrar" → `status='closed'`, `closed_by=admin_id`, `closed_at=now()`.

Adicionar item "Atendimentos" no `NAV` de `src/routes/admin.tsx` com ícone `MessageCircle`.

### Regras de finalização
- Qualquer lado pode encerrar.
- Após `closed`: RLS bloqueia novos inserts em `support_messages`; UI mostra "Atendimento encerrado" e desabilita input.
- Histórico permanece visível no admin (lista com filtro de status inclui finalizados).

## 5. Arquivos

**Novos:**
- `src/routes/dashboard.tsx`
- `src/routes/admin.atendimentos.tsx`
- `src/lib/support.tsx` (provider + hooks)
- `src/components/support/ChatWindow.tsx`
- `src/components/support/ChatLauncher.tsx`
- `src/components/support/AdminChatPanel.tsx`
- `src/components/support/MessageList.tsx`

**Modificados:**
- `src/routes/auth.tsx` — abas login/registro + captcha matemático + redirect por role.
- `src/routes/__root.tsx` — montar `SupportChatProvider` + `ChatLauncher`.
- `src/routes/admin.tsx` — adicionar item "Atendimentos" no menu.
- 1 migração SQL.

**Não alterados:** painel admin existente (produtos/banners/etc), e-commerce público, upload de imagens, header/nav, cart.

## 6. Melhorias futuras (não implementadas agora)

- Notificação por som/push para admin.
- Anexos no chat.
- Atribuição de ticket a admin específico.
- Avaliação do atendimento ao encerrar.
- Integração de pedidos/pagamentos com Histórico de Compras.
- Templates de respostas rápidas para admin.

Pronto pra implementar?
