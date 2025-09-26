# Projeto Integrador - Backend

## Rodar com Docker (Recomendado) 🐳

### Comando único para rodar tudo:
```bash
docker-compose up --build -d
```

### Parar os containers:
```bash
docker-compose down
```

### Ver logs:
```bash
docker-compose logs -f backend
```

## Acessar a aplicação:
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/docs
- **MySQL**: localhost:3306

## Endpoints principais:
- `/alunos` - CRUD de alunos
- `/emprestimos` - CRUD de empréstimos

## Rodar sem Docker:
```bash
npm install
npm start
```