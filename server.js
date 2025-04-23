require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Configurações do Express
const app = express();
app.use(express.static('public')); // <- ISSO AQUI É FUNDAMENTAL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.log('Erro ao conectar ao MongoDB', err));

// Modelo de contato (dados do formulário)
const ContactSchema = new mongoose.Schema({
  nome: String,
  email: String,
  mensagem: String,
});

const Contact = mongoose.model('Contact', ContactSchema);

// Rota para o formulário de contato
app.post('/contato', async (req, res) => {
  const { nome, email, mensagem } = req.body;

  // Armazenar dados no MongoDB
  const newContact = new Contact({ nome, email, mensagem });
  await newContact.save();

  // Enviar e-mail usando Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: 'Novo Contato de ' + nome,
    text: `Nome: ${nome}\nE-mail: ${email}\nMensagem: ${mensagem}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Erro ao enviar e-mail: ', err);
      return res.status(500).send('Erro ao enviar mensagem');
    }
    res.status(200).send('Mensagem enviada com sucesso!');
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
