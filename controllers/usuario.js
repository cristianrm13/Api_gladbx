const nusers = require("../models/usuario");

const crearUser = async (req, res) => {
	try {
		const newUsers = new nusers(req.body);
		await newUsers.save();
        res.status(201).json(newUsers);

	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

const obtenerUser = async (req, res) => {
	try {
		const listcatalog = await nusers.find();
		res.status(200).json(listcatalog);
	} catch (error) {
		res.status(404).json({ message: error.message });
	}
};

const getUserByCategory = async (req, res) => {
    const { nombre } = req.params;

    try {
        const complaints = await nusers.find({ nombre });
        if (complaints.length === 0) {
            return res.status(404).json({ message: "No se encontraron coincidencias." });
        }
        res.status(200).json(complaints);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const actualizarUser = async (req, res) => {
	try {
		const actualizarQueja = await nusers.findByIdAndUpdate(
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

const eliminarUser = async (req, res) => {
	try {
		await nusers.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Queja eliminada" });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

module.exports = { crearUser, obtenerUser, actualizarUser, eliminarUser, getUserByCategory };
