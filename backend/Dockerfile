# 1. Imagem base oficial do Node.js, usando a versão que você especificou
FROM node:22.18.0-alpine

# 2. Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# 3. Copia os arquivos de manifesto do projeto (package.json e package-lock.json)
# Isso otimiza o cache do Docker. A instalação do npm só será executada novamente se esses arquivos mudarem.
COPY package*.json ./

# 4. Instala as dependências do projeto
RUN npm install

# 5. Copia o restante dos arquivos do seu backend para o contêiner
COPY . .

# 6. Cria e popula o banco de dados SQLite
# RUN npm run seed

# 7. Expõe a porta que o backend usará (interna ao contêiner)
EXPOSE 3001

# 8. Comando para iniciar o servidor de desenvolvimento quando o contêiner for executado
CMD [ "npm", "run", "dev" ]
