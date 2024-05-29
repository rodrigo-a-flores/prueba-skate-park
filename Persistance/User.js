import bcrypt from "bcrypt";
import pool from "./config.js";
import jwt from "jsonwebtoken";
const secretKey = process.env.secretKey;

const getSkaters = async (req, res) => {
    const consulta = "SELECT * FROM skaters";
    try {
        const response = await pool.query(consulta);
        if (res) {            
            return res.status(200).json(response.rows);
        } else {            
            return response.rows;
        }
    } catch (error) {
        if (res) {
            return res.status(500).json(error);
        } else {
            throw error;
        }
    }
};
const createSkaters = async (req, res) => {
    const { email, nombre, password, anos_experiencia, especialidad } = req.body;
    const estado = false;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [email, nombre, hashedPassword, anos_experiencia, especialidad, estado]
        };

        const response = await pool.query(query);
        return res.status(201).json({ message: 'Skater created successfully', skater: response.rows[0] });
    } catch (error) {
        console.error('Database insertion error:', error);
        return res.status(500).json({ message: 'An error occurred while creating the skater', error: error.message });
    }
};
const updateSkaters = async (req, res) => {
    const {  nombre, password, anos_experiencia, especialidad } = req.body;
    const { id } = req.params;
    const query = {
        text: `UPDATE skaters SET nombre = $1, password = $2, anos_experiencia = $3, especialidad = $4 WHERE id = $5 RETURNING *`,
        values: [nombre, password, anos_experiencia, especialidad, id]
    }
    try {
        const response = await pool.query(query);
        if (response.rowCount === 0) {
            return res.status(404).json({ message: 'Skater not found' });
        }
        return res.status(200).json({ message: 'Skater updated successfully', skater: response.rows[0] });
    } catch (error) {
        console.error('Database update error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the skater' });
    }
};
const deleteSkaters = async (req, res) => {
    const { id } = req.params;
    const query = {
        text: `DELETE FROM skaters WHERE id = $1 RETURNING *`,
        values: [id]
    }
    try {
        const response = await pool.query(query);
        if (response.rowCount === 0) {
            return res.status(404).json({ message: 'Skater not found' });
        }
        return res.status(200).json({ message: 'Skater deleted successfully', skater: response.rows[0] });
    } catch (error) {
        console.error('Database deletion error:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the skater' });
    }
};
const updateSkaterStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const query = {
            text: `UPDATE skaters SET estado = $1 WHERE id = $2 RETURNING *`,
            values: [estado, id]
        };
        const response = await pool.query(query);

        if (response.rowCount === 0) {
            return res.status(404).json({ message: 'Skater not found' });
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error updating skater status:', error);
        return res.status(500).json({ message: 'An error occurred while updating skater status', error: error.message });
    }
};
const loginSkater = async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = {
            text: 'SELECT * FROM skaters WHERE email = $1',
            values: [email]
        };
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const skater = result.rows[0];
        const isMatch = await bcrypt.compare(password, skater.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: skater.email, id: skater.id, tipo_usuario: skater.tipo_usuario }, secretKey, { expiresIn: '1h' });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        });

        if (skater.tipo_usuario === 'admin') {
            const skaters = await getSkaters();
            res.render('admin', { skaters, user: skater.nombre, tipo_usuario: skater.tipo_usuario });
        } else if (skater.tipo_usuario === 'user') {
            res.render('datos', {
                skater: {
                    email: skater.email,
                    nombre: skater.nombre,
                    anos_experiencia: skater.anos_experiencia,
                    especialidad: skater.especialidad,
                    tipo_usuario: skater.tipo_usuario
                },
                user: skater.nombre,
                tipo_usuario: skater.tipo_usuario
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'An error occurred while logging in', error: error.message });
    }
};
const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
    res.status(200).send(`<script>alert("Sesión terminada"); window.location.href = "/";</script>`);
};

export { 
    getSkaters,
    createSkaters,
    updateSkaters,
    deleteSkaters,
    loginSkater,
    updateSkaterStatus,
    logout
}