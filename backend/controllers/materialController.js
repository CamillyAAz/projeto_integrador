const Material = require("../models/material");

// Criar
exports.create = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todos
exports.findAll = async (req, res) => {
  try {
    const materiais = await Material.findAll();
    res.json(materiais);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar por ID
exports.findById = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: "Material não encontrado" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar
exports.update = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: "Material não encontrado" });

    await material.update(req.body);
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deletar
exports.remove = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: "Material não encontrado" });

    await material.destroy();
    res.json({ message: "Material deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
