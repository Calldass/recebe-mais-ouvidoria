# Recebe+ Ouvidoria — versão 0.1 (demonstração Vercel)

> **Protótipo demonstrativo, NÃO é serviço institucional da ANTT.** Nenhuma autenticação, upload real, API, armazenamento de anexos ou sincronização entre celulares e computadores está implementada nesta versão. Não utilize informações pessoais, vídeos reais, protocolos reais ou documentos de cidadãos.

Esta versão reaproveita a identidade visual do protótipo original e oferece:

- **Página do atendente:** criar recebimentos de demonstração, visualizar links e histórico no navegador.
- **Página do recebimento:** QR Code real gerado *localmente*, link copiável, validade ilustrativa, botão para **simular** um anexo fictício e encerramento ilustrativo.
- **Página do cidadão:** abre normalmente no celular via QR/link quando a aplicação está publicada; permite escolher arquivo e visualizar nome/tamanho, mas **não transmite o conteúdo**.
- **Nenhum serviço externo é consultado para gerar o QR Code.** Uma biblioteca JavaScript local transforma o link em QR; o componente original foi licenciado sob MIT, com arquivo adaptado de `qrcode-terminal` (Apache-2.0).
- **Sem dependências, compilação ou servidor Python na Vercel.** Site HTML/CSS/JS publicado como estático.

## Atenção às limitações da versão

A Vercel apenas hospeda estas telas estáticas. Os recebimentos do painel e os exemplos de arquivos ficam no `localStorage` do navegador do atendente. O cidadão, ao selecionar arquivos no celular, **não faz upload**; o atendente **não recebe** nada em outro dispositivo. O prazo e o encerramento também não são validados em servidor. O painel é público e sem login — **não use dados reais**.

> Se for necessário validar recebimento de um vídeo de um celular no computador, armazenamento persistente e autenticação, isso é escopo da **versão 0.2**, com backend e armazenamento privado apropriados (além de autorização da SUTEC). Publicar o protótipo antigo `app.py` em funções serverless da Vercel não implementa automaticamente upload grande nem persistência de SQLite/arquivos locais.

## 1. Testar no Windows antes de publicar

1. Extraia o ZIP e abra a pasta `recebe-mais-v01`.
2. Dê dois cliques em `abrir_demo_windows.bat`. O arquivo já está adaptado ao Python confirmado no computador ANTT:
   `C:\Users\joao.caldas\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe`.
3. Abra `http://127.0.0.1:8000/` no próprio PC (o `.bat` tentará abrir automaticamente).
4. Gere um recebimento fictício e clique no link. O QR Code que aponta para `127.0.0.1` **não é acessível de outro celular**; teste em outro aparelho após publicar o site.
5. Para encerrar o servidor local pressione `Ctrl+C` na janela aberta.

Para executar manualmente no PowerShell na pasta do projeto:

```powershell
cd .\public
& "C:\Users\joao.caldas\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\python.exe" -m http.server 8000 --bind 127.0.0.1
```

## 2. Publicar no GitHub

1. Acesse https://github.com/new e crie um repositório para a demo (por exemplo, `recebe-mais-ouvidoria-demo`).
2. Suba **os arquivos e pastas que estão dentro** de `recebe-mais-v01` para a **raiz do repositório**: `public/`, `vercel.json`, `README.md`, `.gitignore` e `abrir_demo_windows.bat`.
3. Deixe o repositório privado, se possível. Como a demonstração não tem informações de usuários nem segredos, os arquivos são seguros para versionar, mas a revisão institucional continua necessária antes de tornar o aplicativo público.
4. Confira que `public/index.html` existe no GitHub e que `vercel.json` está na raiz.

**Alternativa com Git em um terminal:**

```bash
git init
# Crie primeiro seu repositório vazio no GitHub
git add .
git commit -m "Recebe+ v0.1 - demonstracao statica"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

O terminal precisará de Git e autenticação no GitHub. Substitua o endereço de exemplo pelo do seu repositório; não cole senhas em scripts.

## 3. Publicar na Vercel

1. Entre em https://vercel.com/new e conecte a conta GitHub, se ainda não estiver integrada.
2. Clique em **Import** no repositório criado.
3. Configure o **Root Directory** como `./` (raiz) e o **Framework Preset** como `Other` (caso seja solicitado).
4. O projeto já contém `vercel.json` com `outputDirectory: "public"`; não é preciso colocar comando de build nem instalar dependências. Se a interface mostrar opções de build, mantenha-as vazias.
5. Clique em **Deploy**. Copie o endereço HTTPS `https://...vercel.app` fornecido pela Vercel.
6. Acesse o site pelo computador, gere o QR e escaneie com o celular. A página **de demonstração** deve abrir no aparelho.

### Atualizações posteriores

Edite os arquivos na sua cópia do projeto e envie um novo commit ao GitHub (`main`). Com o repositório conectado, a Vercel normalmente cria novas publicações automaticamente. Branches diferentes podem gerar links de pré-visualização separados da produção, conforme as configurações da conta/projeto.

## 4. Evolução planejada — versão 0.2

Para enviar vídeos grandes de verdade, precisaremos desenhar um serviço com:

- autenticação corporativa e autorização por atendente; acesso do cidadão limitado ao envio;
- API para criar sessões e receber atualizações persistentes, com trilha de auditoria;
- envio direto e multipart/resumível para **armazenamento privado**, evitando carregar o vídeo inteiro na função da Vercel;
- download autenticado, proteção contra malware, quotas, limites, políticas de retenção, revisão LGPD e segurança;
- validação e publicação autorizadas pela SUTEC; análise de custos e aderência da hospedagem externa às regras institucionais.

## Estrutura

```text
recebe-mais-v01/
├── public/
│   ├── index.html                # Central de atendimento demonstrativa
│   ├── recebimento.html          # QR/link e simulações locais
│   ├── enviar.html               # Simulação de seleção no celular
│   ├── 404.html
│   ├── assets/                   # CSS e JavaScript
│   └── vendor/qrcode.bundle.js   # Gerador QR local (MIT/Apache-2.0)
├── vercel.json                   # Publicação estática e cabeçalhos de proteção
├── abrir_demo_windows.bat        # Teste local com Python corporativo
├── .gitignore
└── README.md
```

### Nota de segurança

O arquivo `vercel.json` aplica políticas restritivas (incluindo `connect-src 'none'`) para que a demonstração não faça requisições AJAX. Estes controles **não tornam um serviço sem backend seguro para dados reais**; apenas reforçam que a v0.1 não processa arquivos. Uma futura versão funcional exigirá configuração inteiramente diferente.
