# AI-chatbot completion api

## Descrição

O projeto consiste em uma API que utiliza o OpenAI ChatGPT para responder a perguntas com base em um conjunto limitado de dados sem a necessidade de treinamento do modelo, usando a técnica de [Retrieval-Augmented Generation (RAG)](https://lucvandonkersgoed.com/2023/12/11/retrieval-augmented-generation-rag-simply-explained/).

## Setup do projeto

🟩 Node.js v22.17.1

Como rodar o projeto sem docker

```bash
    cp sample_.env .env   #preencha as variáveis de ambiente
    npm install
    npm run dev
```

Como rodar os testes (Opcional)

```bash
    npm run test
```

Como rodar o projeto com docker

```bash
    docker-compose up -d
```

Documentação OpenAPI (Swagger)

```bash
    acesse a rota /api
```

## Estrutura do projeto

```bash
project-root/
├── src/                    # Código-fonte principal da aplicação
│   ├── modules/            # Módulos organizados por domínio/funcionalidade
│   │   │
│   │   ├── controller/     # Camada responsável por receber requisições e chamar os serviços
│   │   ├── dto/            # Data Transfer Objects: definem a forma dos dados esperados nas requisições
│   │   ├── interface/      # Definições de interfaces e tipos compartilhados
│   │   ├── repository/     # Comunicação com o banco de dados ou outras fontes de dados
│   │   ├── service/        # Regras de negócio e lógica da aplicação
│   │   └── test/
│   │       │
│   │       ├── mocks/      # Arquivos de simulação input/output para testes
│   │
│   ├── swagger/            # Configurações e definições do Swagger (OpenAPI) para documentação da API
│   │
│   ├── main.ts             # Ponto de entrada da aplicação (bootstrap)
│
├── .env                    # Variáveis de ambiente (ex: credenciais, URLs, etc.)
├── .nvmrc                  # Define a versão do Node.js usada no projeto
├── Dockerfile              # Arquivo de configuração do Docker para construir a imagem do container
```

## Principais decisões técnicas

### Dependências e Tecnologias

Nestjs: framework backend modular e baseado em injeção de dependência.
OpenAI SDK: geração de embeddings e respostas via API oficial.
Typescript: para tipagem e consistência de contrato.

### Separação de responsabilidades (Single Responsibility Principle):

O serviço ConversationsService tem como objetivo orquestrar a geração de respostas do agente de IA. Ele não se preocupa com a implementação da IA ou armazenamento de embeddings diretamente — isso é delegado a serviços especializados:

OpenaiApiService: encapsula chamadas ao OpenAI para gerar embeddings e respostas.

ClaudIaService: responsável por buscas os vetores baseados no embeddings da pergunta do usuário.

### Uso de Embeddings para busca contextual

Antes de gerar qualquer resposta, o serviço extrai a última mensagem do usuário, gera um embedding e realiza a busca vetorial baseado no embedding da mensagem do usuário. O contéudo recuperado é então utilizado como contexto adicional no prompot do agente.

### Design imutável de Mensagens

A manipulação das mensagens do usuário e da IA é imutável e explícita, a resposta da IA nunca substitui a anterior e o histórico é também passado como contexto para a próxima interação.

No momento a api não persiste nenhuma mensagem em nenhum tipo de banco de dados, mas o histórico é armazenado no contexto da resposta.

E se o histórico de mensagens recebido pela api for muito grande, não é garantia que a resposta da IA vai considerar todas as informações, visto que pode transbordar a janela de contexto (tokens) do prompt.

### Uso de Prompt Engineer para Controle Rigoroso de Respostas

A systemPrompt é definida como uma constante controladora, com instruções explícitas:

A IA nunca deve inventar respostas (respeita o [princípio de groundedness](https://www.conversion.com.br/blog/o-que-e-grounding/)).

A IA julga se consegue da uma resposta de qualidade baseado no contexto fornecido ou no histórico da conversa.

```bash
Exemplo de resposta considerando informações do histórico da conversa:
```

```json
{
  "messages": [
    {
      "role": "USER",
      "content": "Hello! How long does a Tesla battery last before it needs to be replaced?"
    },
    {
      "role": "AGENT",
      "content": "Hello! How can I assist you today? I'm Claudia, your Tesla support assistant 😊\nTesla batteries are designed to last many years; the vehicle will notify you if maintenance is needed! Let me know if you have more questions! 🚗⚡"
    },
    {
      "role": "USER",
      "content": "My name is Mike"
    },
    {
      "role": "USER",
      "content": "Do you know my name? if yes, tell me"
    },
    {
      "role": "AGENT",
      "content": "Yes, you mentioned your name is Mike 😊🚗. How can I assist you further today, Mike?"
    }
  ],
  "handoverToHumanNeeded": true,
  "sectionsRetrieved": [
    {
      "score": 0.38024405,
      "content": "Can I buy a Tesla with cryptos like DogeCoins? Yes, this is possible, I'll forward you to talk with Elon. Wait a second please."
    },
    {
      "score": 0.36369288,
      "content": "Can I control my Tesla with my phone? Yes, the Tesla app allows you to lock/unlock doors, check the battery charge, and activate climate control."
    },
    {
      "score": 0.35677007,
      "content": "Does Tesla offer customer support? Yes, Tesla provides support via phone, email, and directly through the app."
    }
  ]
}
```

Quando não há contexto suficiente, a IA responde com uma mensagem padrão (noAnswerMessage). Também seria possível definir uma mensagem mais dinâmica com apenas um pequeno trecho padrão.

Emojis são utilizados para manter um tom leve e amigável. 😄

### Redirecionamento para humano quando ausência de contexto

A IA tem duas chances de pedir por detalhes adicionais antes de redirecionar a conversa para um humano, caso ela mesma julgue que a pergunta do usuário não tem relação com o contexto fornecido.

```bash
Exemplo de resposta quando a IA julga que a pergunta do usuário não tem relação com o contexto fornecido:

```

```json
{
  "messages": [
    {
      "role": "USER",
      "content": "How can IA make a hamburguer?"
    },
    {
      "role": "AGENT",
      "content": "Sorry, but I didn't fully understand your question. Could you please provide more details or rephrase the question so I can better assist you?"
    },
    {
      "role": "USER",
      "content": "Come on, I know you know"
    },
    {
      "role": "AGENT",
      "content": "\"Sorry, but I couldn't understand your question again 😕. To make sure you get the best help, I'll redirect our conversation to one of our human specialists 🧑‍💼✨\""
    }
  ],
  "handoverToHumanNeeded": true,
  "sectionsRetrieved": [
    {
      "score": 0.36641753,
      "content": "Can I buy a Tesla with cryptos like DogeCoins? Yes, this is possible, I'll forward you to talk with Elon. Wait a second please."
    },
    {
      "score": 0.3554426,
      "content": "Do I have to pay to use Superchargers? Yes, there is usually a fee, although some older models come with free charging."
    },
    {
      "score": 0.35262728,
      "content": "Where can I find a Supercharger station? You can locate Supercharger stations on the Tesla website and in the car’s navigation system."
    }
  ]
}
```

### Redirecionamento automático para humano quando contexto recebido pela IA tem type N2.

Conteúdo com type N1: IA tem a capacidade de responder sozinha.

Conteúdo com type N2: IA não tem a capacidade de responder sozinha.

Quando o sistema identifica que pelo menos um dos conteúdo retornado pelo Vetor tem o tipo N2, ele redireciona a conversa para um humano "setando" a propriedade handoverToHumanNeeded: true.
