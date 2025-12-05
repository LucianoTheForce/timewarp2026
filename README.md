# Palco Timewarp - Sistema Parametrico de Torres LED

Sistema 3D parametrico para design de palcos com torres de andaimes, paineis LED Glass e paineis centrais P5/P3.9 com suporte a video em tempo real.

## Caracteristicas Principais

### Torres de Andaime Parametricas
- **Canos de 2m**: Padrao para andaimes modulares
- **Formatos**: Quadrada, Retangular ou Triangular
- **Parametros ajustaveis em tempo real**:
  - Quantidade de torres (2-12)
  - Niveis de altura (2-10, cada nivel = 2m)
  - Raio de disposicao (5-25m)
  - Largura e profundidade das torres
  - Diametro dos canos (30-80mm)
  - Contraventamentos diagonais

### Paineis LED Glass nas Torres
- **Especificacao**: LR3.9-7.8 | 1000x500mm | ~6kg
- Paineis por face configuravel
- Numero de faces com painel ajustavel
- Efeitos de cor animados

### Painel Central
- **LED P5**: Pixel pitch 5mm, Indoor, alta resolucao
- **LED P3.9**: Modulos 500x500mm, alta definicao
- Dimensoes configuraveis (modulos)
- Altura de elevacao ajustavel

### Sistema de Video
- Upload de video local (MP4, WebM)
- URL de video externo
- Aplicacao em todos os paineis LED
- Controles Play/Pause

### Efeitos LED
- Cor solida
- Arco-iris animado
- Pulsar
- Onda
- Video

## Estrutura do Projeto

```
palco timewarp/
├── assets/
│   └── 1.glb              # Modelo 3D original (opcional)
├── js/
│   ├── main.js            # Aplicacao principal e controles
│   ├── stageBuilder.js    # Sistema de construcao parametrica
│   └── lightingSystem.js  # Sistema de iluminacao
├── index.html             # Interface HTML
├── package.json           # Dependencias (opcional)
├── README.md              # Este arquivo
└── CLAUDE.md              # Instrucoes do projeto
```

## Como Executar

### Opcao 1: Servidor Python
```bash
cd "palco timewarp"
python -m http.server 8000
```

### Opcao 2: Node.js
```bash
cd "palco timewarp"
npx http-server -p 8000
```

### Opcao 3: VS Code Live Server
- Instale a extensao "Live Server"
- Clique direito em `index.html` > "Open with Live Server"

Depois acesse: `http://localhost:8000`

## Controles

### Painel de Parametros (Lado Direito)

#### Torres de Andaime
| Parametro | Descricao | Range |
|-----------|-----------|-------|
| Quantidade | Numero de torres | 2-12 |
| Formato | Quadrada/Retangular/Triangular | - |
| Niveis | Altura em niveis de 2m | 2-10 |
| Raio | Distancia do centro | 5-25m |
| Largura/Profundidade | Dimensoes da base | 0.5-3m |

#### Canos (Andaimes)
| Parametro | Descricao | Range |
|-----------|-----------|-------|
| Diametro | Espessura do cano | 30-80mm |
| Cor | Cor dos canos | - |
| Diagonais | Contraventamentos | On/Off |

#### LED Glass
| Parametro | Descricao | Range |
|-----------|-----------|-------|
| Ativo | Liga/desliga paineis | On/Off |
| Paineis/Face | Paineis por face | 1-4 |
| Faces | Faces com painel | 1-4 |

#### Painel Central
| Parametro | Descricao | Range |
|-----------|-----------|-------|
| Tipo | P5/P3.9/Nenhum | - |
| Largura | Modulos horizontal | 2-16 |
| Altura | Modulos vertical | 2-10 |
| Elevacao | Altura do piso | 0-8m |

### Navegacao 3D
- **Arrastar**: Rotacionar camera
- **Scroll**: Zoom
- **Botao direito**: Pan

### Controles de Camera
- **Reset**: Volta a posicao inicial
- **Topo**: Vista de cima
- **Frente**: Vista frontal
- **Lado**: Vista lateral
- **Rotacao Auto**: Giro automatico

## Video nos Paineis

1. **Carregar video local**: Clique em "Carregar Video Local"
2. **Ou use URL**: Cole o link no campo de URL
3. **Aplicar**: Clique em "Aplicar Video aos Paineis"
4. **Controlar**: Use Play/Pause

Formatos suportados: MP4, WebM

## Exportar Configuracao

Clique em "Exportar Configuracao" para baixar um arquivo JSON com todos os parametros atuais. Util para:
- Documentacao do projeto
- Backup de configuracoes
- Compartilhar designs

## Especificacoes Tecnicas

### Paineis LED Glass (LR3.9-7.8)
- Dimensoes: 1000 x 500mm
- Peso: ~6kg
- Transparente/Semi-transparente

### LED P5
- Pixel pitch: 5mm
- Uso: Indoor
- Resolucao: Alta

### LED P3.9
- Modulo: 500 x 500mm
- Pixel pitch: 3.9mm
- Resolucao: Alta definicao

### Canos de Andaime
- Comprimento padrao: 2m
- Diametro padrao: 48mm
- Material visual: Metal

## Requisitos

- Navegador moderno com WebGL 2.0
- Chrome, Firefox, Safari ou Edge atualizados
- Servidor web local (nao abre direto do arquivo)

## Tecnologias

- **Three.js 0.160.0**: Motor 3D
- **OrbitControls**: Controles de camera
- **GLTFLoader**: Carregador de modelos GLB
- **VideoTexture**: Textura de video em tempo real

## Performance

O painel de estatisticas mostra:
- **FPS**: Quadros por segundo
- **Torres**: Quantidade de torres
- **Paineis**: Total de paineis LED
- **Triangulos**: Geometria renderizada

---

**Desenvolvido para design de palcos e eventos**
