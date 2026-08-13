const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const ARQUIVO = path.join(__dirname, 'dados.json');

app.use(express.json());

function lerDados() {
  if (!fs.existsSync(ARQUIVO)) {
    fs.writeFileSync(ARQUIVO, JSON.stringify([], null, 2), 'utf-8');
  }

  const conteudo = fs.readFileSync(ARQUIVO, 'utf-8').trim();
  return conteudo ? JSON.parse(conteudo) : [];
}

function salvarDados(itens) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(itens, null, 2), 'utf-8');
}

app.get('/itens', (req, res) => {
  res.json(lerDados());
});

app.post('/itens', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ erro: 'Corpo da requisição está vazio.' });
  }

  const itens = lerDados();
  const novo = { id: Date.now(), ...req.body };
  itens.push(novo);
  salvarDados(itens);
  res.status(201).json(novo);
});

app.get('/itens/:id', (req, res) => {
  const id = Number(req.params.id);
  const itens = lerDados();
  const item = itens.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ erro: 'Item não encontrado.' });
  }

  res.json(item);
});

app.put('/itens/:id', (req, res) => {
  const id = Number(req.params.id);
  const itens = lerDados();
  const index = itens.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: 'Item não encontrado.' });
  }

  const atualizado = { ...itens[index], ...req.body, id };
  itens[index] = atualizado;
  salvarDados(itens);
  res.json(atualizado);
});

app.delete('/itens/:id', (req, res) => {
  const id = Number(req.params.id);
  const itens = lerDados();
  const index = itens.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: 'Item não encontrado.' });
  }

  const [removido] = itens.splice(index, 1);
  salvarDados(itens);
  res.json({ mensagem: 'Item removido com sucesso.', item: removido });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});