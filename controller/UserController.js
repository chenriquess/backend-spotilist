const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

const getUserById = async (req, res, next) => {
  try {
    let usuario = await User.findById(req.params.id);
    if (usuario === null) {
      res.status(404).json({erro: 'Não foi encontrado um usuario com o id informado'});
    } else {
      req.usuario = usuario;
      next();
    }
  } catch (erro) {
    res.status(500).json({erro: 'O id informado não é válido'});
  }
};

router.get('/', async (req, res) => {
  res.json(await User.find());
});

router.get('/:id', getUserById, (req, res) => {
  res.json(req.usuario);
});

router.post('/', async (req, res) => {
  req.body.senha = await bcrypt.hash(req.body.senha, BCRYPT_SALT_ROUNDS);
  let usuario = await User(req.body).save();
  res.json(usuario);
});

router.put('/:id', getUserById, async (req, res) => {
  req.usuario.email = req.body.email;
  req.usuario.senha = req.body.senha;
  await req.usuario.save();
  res.send('O usuario foi atualizado');
});

router.delete('/:id', getUserById, async (req, res) => {
  await req.usuario.delete();
  res.send('O usuario foi removido');
});

module.exports = router;