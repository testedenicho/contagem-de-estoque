const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

// Configurar MongoDB Atlas
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Definir esquema do item
const itemSchema = {
  name: String,
  quantity: Number,
  description: String
};

let Item;

// Conectar ao MongoDB e configurar modelo
client.connect().then(() => {
  const db = client.db("contagem_de_estoque");
  Item = db.collection('items');

  // Rota para adicionar item
  app.post('/add-item', async (req, res) => {
    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity,
      description: req.body.description
    };

    try {
      await Item.insertOne(newItem);
      res.send('Item adicionado com sucesso!');
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Rota para obter todos os itens
  app.get('/items', async (req, res) => {
    try {
      const items = await Item.find().toArray();
      res.json(items);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Rota para editar item
  app.put('/edit-item', async (req, res) => {
    const { id, quantity } = req.body;
    try {
      await Item.updateOne({ _id: new MongoClient.ObjectID(id) }, { $set: { quantity: quantity } });
      res.send('Item atualizado com sucesso!');
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Rota para deletar item
  app.delete('/delete-item', async (req, res) => {
    const { id } = req.body;
    try {
      await Item.deleteOne({ _id: new MongoClient.ObjectID(id) });
      res.send('Item deletado com sucesso!');
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });

}).catch(console.dir);
