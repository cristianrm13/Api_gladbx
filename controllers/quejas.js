const catalog = require("../models/quejas");

const crearQueja = async (req, res) => {
	try {
		const newCatalog = new catalog(req.body);
		await newCatalog.save();
        res.status(201).json(newCatalog);

	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const obtenerQueja = async (req, res) => {
	try {
		const listcatalog = await catalog.find();
		res.status(200).json(listcatalog);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

const getQuejaByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const complaints = await catalog.find({ category });
        if (complaints.length === 0) {
            return res.status(404).json({ message: "No se encontraron quejas para esta categoría." });
        }
        res.status(200).json(complaints);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const actualizarQueja = async (req, res) => {
	try {
		const actualizarQueja = await catalog.findByIdAndUpdate(
			req.params.id,
			req.body
		);
		if (!actualizarQueja) {
			res.status(404).json({ message: "Queja no encontrada" });
		}
		res.status(200).json({ message: "Queja Actualizada" });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const eliminarQueja = async (req, res) => {
	try {
		await catalog.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Queja eliminada" });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

module.exports = { crearQueja, obtenerQueja, actualizarQueja, eliminarQueja, getQuejaByCategory };
