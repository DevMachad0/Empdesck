const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://admin:303120010@cluster0.5tpri.mongodb.net/projeto_checkpoint?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB conectado');
    // Consultar e exibir itens ao iniciar o servidor
    return Item.find();
  })
  .then(itens => {
    console.log('Itens disponíveis na coleção items:', itens);
  })
  .catch(err => console.error(err));

// Modelos
const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  unidade: { type: String },
  contato: { type: String },
  email: { type: String },
  grupo: { type: String },
  status: { type: String },
  ocupacao: { type: String }
});
const User = mongoose.model('User', UserSchema);
const OCItemSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  descricao: { type: String, required: true },
  apresentacao: { type: String, required: true },
  marca: { type: String, required: true },
  qtdSolicitada: { type: Number, required: true },
  valorUnitario: { type: Number, required: true },
  valorTotal: { type: Number, required: true }
});0
const ItemRecebidoSchema = new mongoose.Schema({
  dtrecebimento: {type: String, required: true},
  Nnota: {type: String, required: true},
  codigo: { type: String, required: true },
  descricao: { type: String, required: true },
  apresentacao: { type: String, required: true },
  marca: { type: String, required: true },
  qtdRecebida: { type: Number, required: true },
  valorUnitario: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
  entregueNosConformes: { type: String, required: true },
  cartaDeTroca: { type: String, required: true }
});

const OCItem = mongoose.model('OCItem', OCItemSchema);

const OrdemCompraSchema = new mongoose.Schema({
  empenho: { type: String, unique: true },
  nup: String,
  ordemCompra: String,
  fornecedor: String,
  arpContratoPregao: String,
  dtEmpenho: Date,
  dtRecebimentoFornecedor: Date,
  projeto: String,
  prioridade: String,
  dtNotificacao: Date,
  informacoesCopla: String,
  notificacao: String,
  observacoes: String,
  dtagendamento:{ type: Date, default: '11/01/0001' },
  status: { type: String, default: 'Emitido' },
  responsavel: { type: String, default: '' }, // Campo responsável deixado em branco
  itens: [OCItemSchema], // Adicionado os itens como parte da ordem de compra
  itensrecebidos: [ItemRecebidoSchema]
});

const OrdemCompra = mongoose.model('OrdemCompra', OrdemCompraSchema);

const FornecedorSchema = new mongoose.Schema({
  razaoSocial: { type: String, required: true },
  nomeFantasia: { type: String, required: true },
  codigo: { type: String, required: true },
  contato: { type: String, required: true },
  cnpj: { type: String, required: true }
});

const Fornecedor = mongoose.model('Fornecedor', FornecedorSchema);

const ItemSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  descricao: { type: String, required: true },
  marca: { type: String, required: true }
}, { collection: 'items' }); // Especifica o nome da coleção

const Item = mongoose.model('Item', ItemSchema);
const comentarioSchema = new mongoose.Schema({
  user: String,
  empenho: String,
  novoComentario: String,
  datahora: String,
});

const Comentario = mongoose.model('Comentario', comentarioSchema);
// Rota para cadastrar um usuário
app.post('/api/cadastrar-usuario', async (req, res) => {
  console.log('Dados recebidos:', req.body);  // Adiciona esta linha para verificar os dados recebidos

  const { nome, user, senha, unidade, contato, email, grupo, status, ocupacao } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);  // Criptografa a senha antes de salvar
    const novoUsuario = new User({
      username: user,
      password: hashedPassword,
      nome,
      unidade,
      contato,
      email,
      grupo,
      status,
      ocupacao
    });

    await novoUsuario.save();
    res.status(200).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Rota para criar um log
app.post('/api/logs', async (req, res) => {
  const { message, level } = req.body;

  try {
    const novoLog = new Log({ message, level });
    await novoLog.save();
    res.status(201).json({ message: 'Log registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
    res.status(500).json({ message: 'Erro ao registrar log' });
  }
});

// Rota para obter logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({ message: 'Erro ao obter logs' });
  }
});

const LogSchema = new mongoose.Schema({
  empenho: { type: String, required: true },
  responsavel: { type: String, required: true },
  status: { type: String, required: true },
  dataHora: { type: String, required: true },
}, { collection: 'logs' });

const Log = mongoose.model('Log', LogSchema);

// Rota para salvar informações do formulário na coleção logs
app.post('/api/salvar-informacoes', async (req, res) => {
  const { empenho, responsavel, status, dataHora } = req.body;

  try {
    const novoLog = new Log({
      empenho,
      responsavel,
      status,
      dataHora,
    });

    await novoLog.save();
    res.status(200).json({ message: 'Informações salvas com sucesso na coleção logs!' });
  } catch (error) {
    console.error('Erro ao salvar informações:', error);
    res.status(500).json({ message: 'Erro ao salvar informações na coleção logs' });
  }
});
// Rota para obter logs com base no empenho
app.get('/api/logs/:empenho', async (req, res) => {
  const { empenho } = req.params;

  try {
    const logs = await Log.find({ empenho });
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ message: 'Erro ao buscar logs' });
  }
});


// Rota para buscar a ordem de compra pelo empenho e retornar os itens recebidos
app.get('/api/ordem-compra/:empenho', async (req, res) => {
  const { empenho } = req.params;

  try {
    const ordemCompra = await OrdemCompra.findOne({ empenho });

    if (!ordemCompra) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada' });
    }

    res.json(ordemCompra);
  } catch (error) {
    console.error('Erro ao buscar ordem de compra:', error);
    res.status(500).json({ message: 'Erro ao buscar ordem de compra' });
  }
});

// Rota para cadastrar um fornecedor
app.post('/api/cadastrar-fornecedor', async (req, res) => {
  const { razaoSocial, nomeFantasia, codigoFornecedor, contatoFornecedor, status, cnpj } = req.body;

  try {
    const novoFornecedor = new Fornecedor({
      razaoSocial,
      nomeFantasia,
      codigo: codigoFornecedor,
      contato: contatoFornecedor,
      status,
      cnpj
    });

    await novoFornecedor.save();
    res.status(200).json({ message: 'Fornecedor cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar fornecedor:', error);
    res.status(500).json({ message: 'Erro ao cadastrar fornecedor' });
  }
});
app.post('/api/atualizar-oc-recebidos', async (req, res) => {
  console.log('Requisição recebida para /api/atualizar-oc-recebidos');
  console.log('Dados recebidos:', req.body);

  try {
      const { empenho, itensRecebidos } = req.body;

      // Encontra a ordem de compra existente
      let ordemCompra = await OrdemCompra.findOne({ empenho });

      if (ordemCompra) {
          // Atualiza os itens recebidos na ordem de compra
          ordemCompra.itensrecebidos = itensRecebidos;
          await ordemCompra.save();
      } else {
          // Se a ordem de compra não existe, envie uma mensagem de erro
          res.status(404).json({ message: 'Ordem de compra não encontrada' });
      }
  } catch (error) {
      console.error('Erro ao atualizar itens recebidos:', error);
      res.status(500).json({ message: 'Erro ao atualizar itens recebidos' });
  }
});

// Rota para cadastrar um item
app.post('/api/cadastrar-item', async (req, res) => {
  const { codigoItem, descricaoItem, marcaItem } = req.body;

  try {
    const novoItem = new Item({
      codigo: codigoItem,
      descricao: descricaoItem,
      marca: marcaItem
    });

    await novoItem.save();
    res.status(200).json({ message: 'Item cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar item:', error);
    res.status(500).json({ message: 'Erro ao cadastrar item' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Encontra o usuário pelo nome de usuário
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Compara a senha fornecida com a senha armazenada
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Verifica o status do usuário
    if (user.status !== 'Ativo') {
      return res.status(403).json({ message: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Gera o token JWT
    const token = jwt.sign({ userId: user._id }, 'secreta', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Erro ao processar a solicitação de login:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
});

// Rota principal para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
});

// Rota para cadastrar a Ordem de Compra
app.post('/api/cadastrar-oc', async (req, res) => {
  console.log('Requisição recebida para /api/cadastrar-oc');
  console.log('Dados recebidos:', req.body);

  try {
      const { ocData, itens } = req.body;
      const ordemCompra = new OrdemCompra({
          ...ocData,
          itens // Adiciona os itens à ordem de compra
      });

      await ordemCompra.save();
      res.status(200).json({ message: 'Ordem de Compra cadastrada com sucesso!' });
  } catch (error) {
      console.error('Erro ao cadastrar Ordem de Compra:', error);
      res.status(500).json({ message: 'Erro ao cadastrar Ordem de Compra' });
  }
});

// Rota para buscar fornecedores com base na consulta
app.get('/api/buscar-fornecedores', async (req, res) => {
  const query = req.query.query || '';

  try {
    const fornecedores = await Fornecedor.find({
      razaoSocial: new RegExp(query, 'i') // Pesquisa insensível a maiúsculas e minúsculas
    });
    res.json(fornecedores);
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({ message: 'Erro ao buscar fornecedores' });
  }
});

// Rota para obter ordens de compra
app.get('/api/ordens-de-compra', async (req, res) => {
  try {
    const ordens = await OrdemCompra.find().populate('responsavel', 'username').exec();
    res.json(ordens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter ordens de compra' });
  }
});

// Rota para obter detalhes de uma ordem de compra pelo número de empenho
app.get('/api/ordemcompras/:empenho', async (req, res) => {
  const { empenho } = req.params;

  try {
    const ordemCompra = await OrdemCompra.findOne({ empenho }).populate('responsavel', 'username').exec();

    if (!ordemCompra) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada' });
    }

    res.json(ordemCompra);
  } catch (error) {
    console.error('Erro ao obter detalhes da ordem de compra:', error);
    res.status(500).json({ message: 'Erro ao obter detalhes da ordem de compra' });
  }
});

// Rota para cadastrar ou atualizar uma Ordem de Compra
app.post('/api/atualizar-oc', async (req, res) => {
  console.log('Requisição recebida para /api/atualizar-oc');
  console.log('Dados recebidos:', req.body);

  try {
    const { ocData, itens } = req.body;
    const { empenho } = ocData;

    // Verifica se a ordem de compra já existe
    let ordemCompra = await OrdemCompra.findOne({ empenho });

    if (ordemCompra) {
      // Atualiza a ordem de compra existente
      ordemCompra.set({
        ...ocData,
        itens // Atualiza os itens
      });
      await ordemCompra.save();
      res.status(200).json({ message: 'Ordem de Compra atualizada com sucesso!' });
    } else {
      // Cria uma nova ordem de compra
      ordemCompra = new OrdemCompra({
        ...ocData,
        responsavel: '', // Campo 'responsavel' deixado em branco
        itens // Adiciona os itens à ordem de compra
      });
      await ordemCompra.save();
      res.status(200).json({ message: 'Ordem de Compra cadastrada com sucesso!' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar ou atualizar Ordem de Compra:', error);
    res.status(500).json({ message: 'Erro ao cadastrar ou atualizar Ordem de Compra' });
  }
});

// Rota para obter todos os itens
app.get('/api/novoItem', async (req, res) => {
  try {
    const itens = await Item.find();
    res.json(itens);
  } catch (error) {
    console.error('Erro ao obter itens:', error);
    res.status(500).json({ message: 'Erro ao obter itens' });
  }
});

// Rota para obter um item específico pelo código
app.get('/api/novoItem/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const item = await Item.findOne({ codigo });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao obter item:', error);
    res.status(500).json({ message: 'Erro ao obter item' });
  }
});
// Rota para adicionar comentários
app.post('/api/comentarios', async (req, res) => {
  const comentarios = req.body;

  try {
      // Para armazenar comentários que ainda não existem
      const uniqueComentarios = [];

      for (const comentario of comentarios) {
          // Verifica se o comentário já existe no banco de dados
          const existingComentario = await Comentario.findOne({
              user: comentario.user,
              empenho: comentario.empenho,
              novoComentario: comentario.novoComentario
          });

          // Se não existe, adiciona à lista de comentários únicos
          if (!existingComentario) {
              uniqueComentarios.push(comentario);
          }
      }

      // Salva todos os comentários únicos no banco de dados
      if (uniqueComentarios.length > 0) {
          await Comentario.insertMany(uniqueComentarios);
      }

      res.status(201).send(uniqueComentarios);
  } catch (error) {
      res.status(500).send({ message: 'Erro ao salvar os comentários', error });
  }
});
// Rota para obter todos os itens e armazená-los em variáveis dinamicamente
app.get('/api/novoItem', async (req, res) => {
  try {
    const itens = await Item.find();
    
    // Cria um objeto para armazenar os itens com nomes dinâmicos
    const itemStorage = {};

    // Itera sobre os itens e armazena cada um com uma chave dinâmica
    itens.forEach((item, index) => {
      const key = `Item${index + 1}`;
      itemStorage[key] = item;
    });

    // Exibe as variáveis no console
    console.log('Itens armazenados como variáveis dinâmicas:');
    for (const [key, value] of Object.entries(itemStorage)) {
      console.log(`${key}:`, value);
    }

    // Retorna os itens como resposta
    res.json(itens);
  } catch (error) {
    console.error('Erro ao obter itens:', error);
    res.status(500).json({ message: 'Erro ao obter itens' });
  }
});
// Rota para buscar comentários por empenho
app.get('/api/comentarios/:empenho', async (req, res) => {
  const { empenho } = req.params;

  try {
    const comentarios = await Comentario.find({ empenho }).sort({ datahora: -1 }); // Certifique-se que o campo "datahora" existe
    res.status(200).json(comentarios);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro ao buscar comentários' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse o servidor em: http:localhost:${port}`);
});
