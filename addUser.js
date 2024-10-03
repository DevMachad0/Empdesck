const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conecte-se ao MongoDB
mongoose.connect('mongodb://localhost:27017/projeto_checkpoint', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Defina o esquema e modelo do usuário
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

// Função para adicionar um usuário
const addUser = async (username, password) => {
  try {
    // Verifique se o usuário já existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Usuário já existe!');
      return;
    }

    // Faça o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crie um novo usuário
    const user = new User({
      username,
      password: hashedPassword
    });

    // Salve o usuário no banco de dados
    await user.save();
    console.log('Usuário adicionado com sucesso!');
  } catch (err) {
    console.error('Erro ao adicionar usuário:', err);
  } finally {
    mongoose.connection.close();
  }
};

// Obtenha argumentos da linha de comando e adicione o usuário
const [,, username, password] = process.argv;
if (!username || !password) {
  console.log('Uso: node addUser.js <username> <password>');
} else {
  addUser(username, password);
}
