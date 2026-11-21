function parseId(req, res, next) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id < 1) {
    return res.status(400).json({
      status:  'error',
      message: 'ID harus berupa bilangan bulat positif.',
    });
  }

  req.params.id = id;
  next();
}

module.exports = parseId;
