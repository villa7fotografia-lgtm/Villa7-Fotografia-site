# Villa7 Fotografia — Album Creator & Production Suite

Aplicativo web profissional completo desenvolvido para **Villa7 Fotografia** para criação, diagramação inteligente, visualização 3D em formato flipbook (15x20 cm vertical / 20x30 cm aberto panorâmico), geração de PDF de alta resolução em formato A3 com marcas de corte e integração direta com o **Supabase Storage**.

---

## 🚀 Principais Funcionalidades

1. **Gestão e Preparação do Projeto**: Cadastro de clientes, título do álbum e configuração de lâminas panorâmicas.
2. **Estúdio de Criação com IA / Layout Automático**: Posicionamento inteligente de fotografias mantendo miolo 100% branco e sem cortes indesejados, com filtros e ajustes de corte.
3. **Visualizador 3D (Flipbook)**: Pré-visualização interativa realista do álbum fechado e aberto (15x20 cm / 20x30 cm).
4. **Geração de PDF Gráfico de Alta Resolução**: Criação automatizada de PDFs em formato A3 com imposição gráfica e marcas de corte profissionais.
5. **Integração com Supabase Storage**: Envio automático e seguro do PDF gerado para o bucket do Supabase (`Villa7 Fotografia`) através de rotas de servidor com bypass de RLS, garantindo 100% de confiabilidade.
6. **Download de Cópia Local**: Download simultâneo de uma cópia de segurança do PDF no dispositivo do cliente.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion, Canvas Confetti.
- **Backend / API**: Node.js, Express, @supabase/supabase-js, jsPDF.
- **Build System**: Vite & Esbuild.

---

## 📦 Como Instalar e Executar Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou **yarn**

### 1. Clonar o Repositório
```bash
git clone https://github.com/villa7albuns/album-creator.git
cd album-creator
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env` e preencha com as suas chaves do Supabase:
```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure:
```env
SUPABASE_URL=https://twfhqhkzabvlzkgofjyj.supabase.co
SUPABASE_SECRET_KEY=sua_chave_secreta_aqui
SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_aqui
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará rodando em `http://localhost:3000`.

### 5. Compilar para Produção
```bash
npm run build
```

### 6. Iniciar Servidor de Produção
```bash
npm start
```

---

## 📄 Licença
Desenvolvido exclusivamente para **Villa7 Fotografia**. Todos os direitos reservados.
Feito por: **@villa7albuns**
