const User = require('../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { getLogger } = require('@jwt/utils');
const log = getLogger(__dirname, __filename);

async function getUsers(req, res, next) {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }
        return res.status(200).json(users);
    } catch (err) {
        log.error('Ups, hubo un error al obtener usuarios: ' + err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function createUser(req, res) {
    try {
        const { errors, isValid } = validateRegisterInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            errors.message = 'El correo electrónico ya está en uso';
            return res.status(400).json(errors);
        }

        const avatar = gravatar.url(req.body.email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'usuario',
            avatar
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);

        newUser.password = hash;

        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (err) {
        console.error('Ups, hubo un error al crear usuario: ' + err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function updateUser(req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function deleteUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
