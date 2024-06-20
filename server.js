const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
app.use(express.static('public')); // Servir arquivos estáticos da pasta public

let Item;

// Conectar ao MongoDB e configurar modelo
client.connect().then(() => {
  const db = client.db("contagem_de_estoque");
  Item = db.collection('items');

  // Rota para adicionar item
  app.post('/add-item', async (req, res) => {
    console.log('Recebendo solicitação para adicionar item:', req.body);
    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity,
      description: req.body.description
    };

    try {
      const result = await Item.insertOne(newItem);
      console.log('Item adicionado com sucesso:', result);
      res.send('Item adicionado com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
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
      await Item.updateOne({ _id: new ObjectId(id) }, { $set: { quantity: quantity } });
      res.send('Item atualizado com sucesso!');
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Rota para deletar item
  app.delete('/delete-item', async (req, res) => {
    const { id } = req.body;
    try {
      await Item.deleteOne({ _id: new ObjectId(id) });
      res.send('Item deletado com sucesso!');
    } catch (err) {
      res.status(400).send(err);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });

}).catch(console.dir);
