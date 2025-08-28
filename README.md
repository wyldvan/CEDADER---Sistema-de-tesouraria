### Como Usar a Nova Configuração
Agora você tem dois ambientes distintos que pode gerenciar facilmente:
Para rodar em modo de DESENVOLVIMENTO (com nodemon e hot-reload):
Bash
# Usa o docker-compose.yml padrão
```
docker compose up --build
```
Para rodar em modo de PRODUÇÃO (otimizado e seguro):
Bash
# Usa o -f para especificar o arquivo de configuração de produção
```
docker compose -f docker-compose.prod.yml up --build
```
Importante: Antes de rodar o comando de produção, pare o de desenvolvimento (docker-compose down), pois ambos tentam usar a mesma pasta backend/data e podem tentar usar as mesmas portas se você não as alterar.