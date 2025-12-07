# 🚀 Deploy no Vercel - Palco Timewarp

## Sistema de Controle Remoto Mobile → Desktop

Este projeto permite controlar a visualização 3D do palco remotamente usando um dispositivo mobile como controle remoto.

---

## 📱 Como Funciona

### Desktop (Tela Grande > 900px)
- Exibe o **menu completo** no lado direito
- Mostra a visualização 3D do palco em tela cheia
- Recebe comandos do mobile via WebSocket

### Mobile (Tela Pequena < 900px)
- Exibe **interface simplificada** com 4 quadrantes coloridos:
  - 🎥 **Câmera** - Controles de navegação
  - 💡 **Cenas LED** - 8 efeitos diferentes
  - ✨ **Luzes & Lasers** - 8 animações
  - 🎵 **Música** - Player com controles

- Envia comandos para outros dispositivos conectados

---

## 🌐 Deploy no Vercel

### Passo 1: Preparar o Projeto

```bash
# Instalar dependências
npm install

# Testar localmente
npm run dev
```

### Passo 2: Criar Conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab/Bitbucket
3. Conecte seu repositório

### Passo 3: Deploy

#### Opção A: Via GitHub (Recomendado)

1. Faça push do código para o GitHub:
```bash
git add .
git commit -m "Deploy: Sistema de controle remoto mobile"
git push origin main
```

2. No Vercel:
   - Clique em "New Project"
   - Selecione seu repositório
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Clique em "Deploy"

#### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Passo 4: Configurar Domínio (Opcional)

No painel do Vercel:
1. Vá em "Settings" > "Domains"
2. Adicione seu domínio customizado
3. Configure os DNS conforme instruções

---

## 🎮 Como Usar

### 1. Abrir no Desktop
```
https://seu-projeto.vercel.app
```
- Visualização 3D em tela cheia
- Menu completo no lado direito

### 2. Abrir no Mobile
```
https://seu-projeto.vercel.app
```
- Interface de controle simplificada
- 4 quadrantes coloridos com ícones grandes

### 3. Controlar Remotamente
- **Todos os dispositivos** conectados à mesma URL sincronizam automaticamente
- **Mobile controla Desktop** em tempo real via WebSocket
- Funciona em **rede local** ou **internet**

---

## 🎵 Adicionar Músicas

1. Coloque arquivos MP3/WAV/OGG em:
```
assets/musicas/
```

2. Renomeie para:
```
track1.mp3
track2.mp3
track3.mp3
```

3. Ou edite `js/audioSystem.js` para caminhos personalizados

---

## ✨ Funcionalidades Audio-Reativas

### Cenas LED
- **🎵 Audio** - Reage ao volume e frequências
- **🔊 Bass** - Reage aos graves com flash no beat

### Luzes/Lasers
- **🎧 Sync** - Sincronizado com volume e médios
- **🥁 Kick** - Movimento brusco no kick/bass

---

## 🛠️ Arquitetura Técnica

### Frontend
- **Three.js** - Renderização 3D
- **Vite** - Build tool
- **Responsive Design** - Media queries para desktop/mobile

### Backend (Serverless)
- **Vercel Serverless Functions** - API WebSocket
- **Socket.io** - Sincronização em tempo real
- **BroadcastChannel API** - Comunicação cross-tab (fallback)

### Sincronização
```
Mobile (Controller) → WebSocket → Desktop (Display)
```

---

## 📁 Estrutura de Arquivos

```
palco-timewarp/
├── api/
│   └── socket.js           # Serverless WebSocket
├── js/
│   ├── main.js             # App principal + sync
│   ├── stageBuilder.js     # Construção do palco 3D
│   ├── audioSystem.js      # Análise de áudio
│   ├── syncManager.js      # Gerenciador de sincronização
│   ├── lightingSystem.js   # Sistema de iluminação
│   └── laserController.js  # Controle de lasers
├── assets/
│   └── musicas/            # Arquivos de música
├── index.html              # HTML com responsive design
├── vercel.json             # Configuração Vercel
├── package.json            # Dependências
└── DEPLOY.md               # Este arquivo
```

---

## 🐛 Troubleshooting

### WebSocket não conecta
- Verifique se o Vercel deployou a função `/api/socket`
- Teste a URL: `https://seu-projeto.vercel.app/api/socket`

### Mobile não sincroniza
- Verifique o console do navegador (F12)
- Confirme que ambos dispositivos estão na mesma URL
- Aguarde alguns segundos para conexão

### Músicas não carregam
- Verifique o caminho dos arquivos
- Teste os URLs no navegador
- Configure CORS se necessário

---

## 📊 Monitoramento

### Logs do Vercel
```bash
vercel logs seu-projeto.vercel.app
```

### Console do Navegador
- Desktop: `F12` → Console
- Mobile: Inspecionar via Chrome DevTools (chrome://inspect)

---

## 🎯 Próximos Passos

- [ ] Adicionar mais cenas LED/Lasers
- [ ] Implementar beat detection melhorado
- [ ] Adicionar gravação de performances
- [ ] Criar sistema de presets

---

## 📞 Suporte

Em caso de dúvidas:
1. Verifique os logs do Vercel
2. Inspecione o console do navegador
3. Teste localmente com `npm run dev`

---

Feito com ❤️ para Palco Timewarp
