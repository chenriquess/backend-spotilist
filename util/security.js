const jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

const autoriza = (req, res, next) => {
  if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    return res.status(401).json({auth: false, mensagem: 'token não informado'});
  } else {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({auth: false, mensagem: 'token não autorizado'});
      } else {
        req.usuario = decoded;
        next();
      }
    });
  }
};

module.exports = { autoriza };