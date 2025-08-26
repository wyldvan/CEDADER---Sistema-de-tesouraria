# --- Estágio 1: Build ---
# Usa a imagem do Node.js para instalar dependências e compilar o projeto
FROM node:22.18.0-alpine as builder

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de manifesto e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o comando de build para gerar os arquivos estáticos
# (Assumindo que seu projeto tenha um script 'build'. Se não, use 'npm run dev')
RUN npm run build

# --- Estágio 2: Produção ---
# Usa uma imagem leve do Nginx para servir os arquivos estáticos
FROM nginx:stable-alpine

# Copia os arquivos estáticos compilados do estágio 'builder' para o diretório padrão do Nginx
# O diretório de saída do 'npm run build' geralmente é 'dist' ou 'build'. Ajuste se necessário.
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o seu arquivo de configuração personalizado do Nginx para o contêiner
COPY nginx.conf /etc/nginx/conf.d/

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
