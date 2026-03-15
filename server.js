const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); //Libera Para o Angular Acessar

//Conexao com o Banco
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

//Listar (Read)
app.get('/products', (req, res)=> {
    db.query('SELECT * FROM products', (err, result) => {
        res.send(result);
    });
});

//Cadastrar (POST)
app.post('/products', (req, res) => {
    const { Name, Price } = req.body;
    db.query('INSERT INTO products (Name, Price) VALUES (?, ?)', [Name, Price], (err, result) => {
        if (err) {
            console.error("Erro ao inserir no banco:", err);
            return res.status(500).send(err);
        }
        res.status(201).send(result);
    });
});

//Editar (PUT)
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Price } = req.body;
    db.query('UPDATE products SET Name = ?, Price = ? WHERE Id = ?', [Name, Price, id], (err, result) => res.json(result))
});

//Deletar (DELETE)
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE Id = ?', [id], (err, result) => res.json(result));
});

app.listen(3000, () => console.log("Servidor Node Rodando na Porta 3000"));