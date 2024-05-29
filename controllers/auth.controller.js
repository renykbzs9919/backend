const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateLoginInput = require('../validacion/login');
const User = require('../models/User');

// Función de login
async function login(req, res) {
    try {
        const { errors, isValid } = validateLoginInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            errors.message = 'El usuario no existe';
            return res.status(404).json(errors);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const payload = {
                id: user.id,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            };

            jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    console.error('Error en token', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }
                return res.status(200).json({
                    message: "Bienvenido " + user.name,
                    jwt: token
                });
            });
        } else {
            errors.message = 'Contraseña incorrecta';
            return res.status(400).json(errors);
        }
    } catch (err) {
        console.error('Ups hubo un error en el Login Controller! ' + err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

// Función de logout
async function logout(req, res) {
    try {
        req.logout();  // Esto elimina la sesión de Passport.js (si se está utilizando)

        // Eliminar la cookie del cliente
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Asegúrate de que se use secure en producción
            sameSite: 'strict'
        });

        res.status(200).json({ message: "Logout exitoso" });
    } catch (err) {
        console.error('Error en el logout:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

module.exports = {
    login,
    logout
};
