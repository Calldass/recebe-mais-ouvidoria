# Recebe+ Ouvidoria · v0.2 (TESTE NA NUVEM)

Protótipo funcional em HTML, CSS, JavaScript (frontend) e Vercel Functions/Node.js (API). Arquivos são enviados diretamente para **Vercel Blob PRIVATE**. O projeto **não** deve receber informações ou vídeos reais de cidadãos sem uma aprovação institucional adequada. É um teste técnico em conta pessoal, sem integração com o ambiente da ANTT.

## 1. O que funciona

- Atendente acessa `/entrar.html` com uma senha de teste definida no ambiente da Vercel (cookie HttpOnly, SameSite=Strict; expira em 8h).
- O painel `/` permite criar sessões com prazo de 30 minutos, 2, 8 ou 24 horas; os registros ficam persistidos no Blob privado.
- Um QR Code local aponta para `/enviar.html?convite=...` no domínio público principal, sem exigir login do cidadão.
- O backend autentica o convite assinado, confirma que a sessão está ativa e limita formatos, quantidade (**até 5 por recebimento**, em condições normais de uso) e tamanho (**1 GB por arquivo por padrão**).
- O celular envia diretamente ao Blob privado usando upload multipart com progresso e tentativas de repetição de partes.
- No painel o atendente consegue consultar arquivos e abrir um link assinado de download que expira em 5 minutos.
- Sessões expiradas e respectivos anexos são excluídos pelo endpoint de limpeza agendado, por padrão três dias **após o vencimento do recebimento**.

## 2. Atualizar o GitHub que você já utiliza

Repositório: `https://github.com/Calldass/recebe-mais-ouvidoria`

**Importante:** a Vercel já está configurada com **Root Directory `recebe-mais-v01`**. Dentro do ZIP, existe uma pasta com ESSE MESMO NOME. Atualize **o conteúdo dessa pasta no GitHub**, sem criar `recebe-mais-v01/recebe-mais-v01`.

Envie/substitua os arquivos/pastas dentro de `recebe-mais-v01`:

- `api/` (novo)
- `lib/` (novo)
- `public/` (substituir/atualizar)
- `package.json` (novo)
- `vercel.json` (substituir)
- `tests/` (novo)

**Não** envie segredos em `.env`, `.env.local` ou arquivos de anotações. NÃO coloque credenciais no GitHub nem no JavaScript do navegador.

**Aviso:** `public/assets/send.js` é gerado automaticamente no build Vercel a partir de `public/assets/send-src.js`. Não precisa criá-lo manualmente.

## 3. Criar armazenamento privado na Vercel

1. Abra `https://vercel.com/jaocaldass-5780/recebe-mais-ouvidoria`.
2. Acesse **Storage** → **Create** → **Blob** (os nomes podem mudar conforme o dashboard).
3. Escolha acesso **Private**, nunca Public.
4. Nome sugerido: `recebe-mais-teste`.
5. Associe a **Production** (ambiente necessário para o domínio principal).
6. Verifique em **Settings > Environment Variables** que está disponível `BLOB_READ_WRITE_TOKEN`. Ele deve existir somente como variável secreta no servidor. Se a integração criou apenas variáveis OIDC, consulte as configurações da store para obter um token de leitura/escrita compatível com `handleUpload` ou ajuste a integração para o fluxo OIDC; **não** cole esse token no GitHub.

## 4. Configurar as outras variáveis de ambiente

Acesse **Settings** → **Environment Variables** e crie na opção **Production**:

| Nome | Valor | Observações |
|---|---|---|
| `APP_SECRET` | string aleatória com no mínimo 32 caracteres | Assina os convites e a sessão do atendente |
| `STAFF_PASSWORD` | senha forte de no mínimo 16 caracteres | Senha do painel de testes; não compartilhar publicamente |
| `CRON_SECRET` | string aleatória com no mínimo 16 caracteres | Protege `/api/cleanup` |
| `MAX_FILE_MB` | `1024` | Limite por arquivo de 1 GB; pode diminuir para `50` durante testes iniciais |
| `RETENTION_DAYS` | `3` | Remove arquivos e sessões 3 dias após o vencimento |

Para criar senhas seguras no PowerShell usando o Python que você já tem:

```powershell
& "C:\Users\joao.caldas\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe" -c "import secrets; print(secrets.token_urlsafe(36))"
```

Rode o mesmo comando **três vezes**, usando cada resultado em uma variável diferente. Guarde a senha `STAFF_PASSWORD` em gerenciador apropriado. Nunca envie essas chaves por WhatsApp, e-mail ou mensagens do GitHub.

Depois de vincular o Blob e salvar as variáveis, execute um **Redeploy** em **Deployments** para aplicar as configurações.

## 5. Confirmar o teste

1. Abra `https://recebe-mais-ouvidoria.vercel.app/api/health` e confirme que mostra `"status":"configured"`.
2. Abra `https://recebe-mais-ouvidoria.vercel.app/entrar.html` e entre com `STAFF_PASSWORD`.
3. Crie um recebimento com referência fictícia e abra a tela do QR Code.
4. Escaneie pelo celular usando a **rede móvel**, para testar o acesso público sem login Vercel.
5. Envie apenas um PDF ou vídeo **fictício pequeno**, preferencialmente menos de 10 MB no primeiro teste.
6. Retorne ao painel, atualize os anexos e clique **Baixar**.
7. Confira a exclusão após o período de retenção escolhido e a execução da tarefa programada.

Se `/api/health` mostrar `pending`, alguma variável está faltando na implantação de produção.

## 6. Limitações e pendências (obrigatórias antes de uso real)

- **Não é homologado nem institucional.** Hospedagem externa em conta pessoal ainda requer avaliação de segurança, LGPD, localização dos dados, aprovação/contratação e regras de governança da ANTT; Vercel não elimina a necessidade de envolver a SUTEC para uso real.
- Não há antivírus ou varredura de malware, análise profunda de conteúdo, quota rigorosa por IP ou proteção suficiente contra ataques de força bruta na autenticação. A senha única de teste não equivale ao Microsoft Entra ID.
- O limite de 5 arquivos é consultado antes de gerar o token de upload e pode ser ultrapassado se houver envios concorrentes. **Não utilizar em público com usuários reais** sem limitação transacional e controles de abuso.
- O upload multipart tenta novamente partes que falham durante a conexão, mas **não retoma depois de fechar/reabrir a página**. O usuário precisa reenviar o arquivo.
- A limpeza dos arquivos precisa ser validada no ambiente da Vercel. Cron usa `CRON_SECRET`; a exclusão não é instantânea. Custos de armazenamento e tráfego podem ocorrer.
- A extensão declarada do arquivo não prova que o conteúdo é seguro ou corresponde ao tipo informado.
- Evite registrar tokens de convite ou URLs assinadas de download em ferramentas de analytics ou logs adicionais.
- A tela de login e o código HTML do painel são públicos, mas as operações de API e os arquivos são protegidos. A Vercel Authentication deve continuar habilitada para URLs de prévia; o domínio principal de produção deve estar liberado ao cidadão.
- O nome Recebe+ é apenas ilustrativo, não é um nome ou produto oficial da ANTT.

## 7. Tecnologias

- `@vercel/blob` ^2.4 (Private Storage e URLs assinadas)
- `@vercel/blob/client` com `multipart: true`
- Vercel Functions para APIs em `api/`
- Esbuild gera o bundle do cliente durante `npm run build`
- `lib/repo.js` usa arquivos JSON dentro do Blob privado como pequeno registro de sessões de teste (não adequado para escala institucional)

## 8. Estrutura

```text
recebe-mais-v01/
  api/                # funções serverless
  lib/                # lógica e validação
  public/             # frontend HTML/CSS/JS
    assets/send-src.js # bundle compilado no build
    vendor/qrcode.bundle.js
  tests/              # testes de funções centrais
  package.json
  vercel.json
```

## 9. Testes locais de código

Se tiver Node.js e dependências instaladas:

```bash
npm install
npm test
npm run build
```

Para simular Functions localmente precisará da Vercel CLI e das variáveis seguras, e os webhooks de conclusão Blob podem exigir URL pública. Prefira os testes end-to-end no ambiente de Vercel com arquivos fictícios.
