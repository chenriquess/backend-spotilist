const express = require('express');
const router = express.Router();
const Playlist = require('../model/playlist');

const getPlaylistPorId = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.path.id);

    if (playlist === null) {
      res.status(404).json({erro: `Playlist com id ${req.params.id} não encontrado`});
    } else {
      req.playlist = playlist;
      next();
    }
  } catch (e) {
    res.status(500).json({erro: `O id "${req.params.id}" não é válido`});
  }
};

router.get('/', async (req, res) =>
  res.json(await Playlist.find())
);

router.get('/:id', getPlaylistPorId, (req, res) => {
  res.json(req.playlist);
});

router.post('/', async (req, res) => {
  let playlist = await Playlist(req.body).save();
  res.json(playlist);
});

router.put('/:id', getPlaylistPorId, async (req, res) => {
  await Playlist.update(req.body);
  res.send('Playlist atualizada com sucesso!');
});

router.delete('/:id', getPlaylistPorId, async (req, res) => {
  await req.playlist.delete();
  res.send('Playlist removida com sucesso!');
});


module.exports = router;