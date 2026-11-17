
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getConnection = require('../db');

const router = express.Router();

// ADMIN REGISTRATION - DISABLED
router.post('/register', (req, res) => {
    return res.status(403).json({
        success: false,
        message: 'Admin registration is disabled'
    });
});


// ADMIN LOGIN
router.post('/login', async (req, res) => {
    let connection;

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        connection = await getConnection();

        const result = await connection.execute(
            `SELECT ADMIN_ID, USERNAME, PASSWORD_HASH
             FROM ADMIN_USERS
             WHERE USERNAME = :username`,
            { username: username.trim() },
            { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const admin = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            admin.PASSWORD_HASH
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            {
                adminId: admin.ADMIN_ID,
                username: admin.USERNAME
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                adminId: admin.ADMIN_ID,
                username: admin.USERNAME
            }
        });

    } catch (error) {
        console.error('Login Error:', error);

        res.status(500).json({
            success: false,
            message: 'Login failed'
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;
