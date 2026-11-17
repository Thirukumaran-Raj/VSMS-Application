
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const getConnection = require('./db');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// AUTHENTICATION ROUTES
app.use('/api/auth', authRoutes);

// PROTECT ALL OTHER API ROUTES
app.use('/api', verifyToken);

// HOME API
app.get('/', (req, res) => {
    res.send('Vehicle Service Management API is Running!');
});

// TEST DATABASE CONNECTION
app.get('/api/test-db', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            "SELECT 'Oracle Connected Successfully!' AS MESSAGE FROM DUAL"
        );

        res.json({
            success: true,
            message: result.rows[0][0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET CUSTOMERS
app.get('/api/customers', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT CUSTOMER_ID, CUSTOMER_NAME, PHONE, EMAIL, ADDRESS
             FROM CUSTOMERS
             ORDER BY CUSTOMER_ID`
        );

        const customers = result.rows.map(row => ({
            customer_id: row[0],
            customer_name: row[1],
            phone: row[2],
            email: row[3],
            address: row[4]
        }));

        res.json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET VEHICLES
app.get('/api/vehicles', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
                V.VEHICLE_ID,
                C.CUSTOMER_NAME,
                V.CUSTOMER_ID,
                V.VEHICLE_NUMBER,
                V.BRAND,
                V.MODEL,
                V.VEHICLE_TYPE,
                V.MANUFACTURING_YEAR
             FROM VEHICLES V
             JOIN CUSTOMERS C ON V.CUSTOMER_ID = C.CUSTOMER_ID
             ORDER BY V.VEHICLE_ID`
        );

        const vehicles = result.rows.map(row => ({
            vehicle_id: row[0],
            customer_name: row[1],
            customer_id: row[2],
            vehicle_number: row[3],
            brand: row[4],
            model: row[5],
            vehicle_type: row[6],
            manufacturing_year: row[7]
        }));

        res.json({
            success: true,
            count: vehicles.length,
            vehicles
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET SERVICES
app.get('/api/services', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT SERVICE_ID, SERVICE_NAME, DESCRIPTION, SERVICE_PRICE
             FROM SERVICE_TYPES
             ORDER BY SERVICE_ID`
        );

        const services = result.rows.map(row => ({
            service_id: row[0],
            service_name: row[1],
            description: row[2],
            service_price: row[3]
        }));

        res.json({
            success: true,
            count: services.length,
            services
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET BOOKINGS
app.get('/api/bookings', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
                B.BOOKING_ID,
                C.CUSTOMER_NAME,
                V.VEHICLE_NUMBER,
                S.SERVICE_NAME,
                S.SERVICE_PRICE,
                B.BOOKING_DATE,
                B.SERVICE_DATE,
                B.BOOKING_STATUS
             FROM BOOKINGS B
             JOIN CUSTOMERS C ON B.CUSTOMER_ID = C.CUSTOMER_ID
             JOIN VEHICLES V ON B.VEHICLE_ID = V.VEHICLE_ID
             JOIN SERVICE_TYPES S ON B.SERVICE_ID = S.SERVICE_ID
             ORDER BY B.BOOKING_ID`
        );

        const bookings = result.rows.map(row => ({
            booking_id: row[0],
            customer_name: row[1],
            vehicle_number: row[2],
            service_name: row[3],
            service_price: row[4],
            booking_date: row[5],
            service_date: row[6],
            booking_status: row[7]
        }));

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET INVOICES
app.get('/api/invoices', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
                I.INVOICE_ID,
                I.BOOKING_ID,
                C.CUSTOMER_NAME,
                I.TOTAL_AMOUNT,
                I.PAYMENT_STATUS,
                I.PAYMENT_DATE
             FROM INVOICES I
             JOIN BOOKINGS B ON I.BOOKING_ID = B.BOOKING_ID
             JOIN CUSTOMERS C ON B.CUSTOMER_ID = C.CUSTOMER_ID
             ORDER BY I.INVOICE_ID`
        );

        const invoices = result.rows.map(row => ({
            invoice_id: row[0],
            booking_id: row[1],
            customer_name: row[2],
            total_amount: row[3],
            payment_status: row[4],
            payment_date: row[5]
        }));

        res.json({
            success: true,
            count: invoices.length,
            invoices
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// GET BOOKING LOGS
app.get('/api/booking-logs', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT
                LOG_ID,
                BOOKING_ID,
                OLD_STATUS,
                NEW_STATUS,
                CHANGED_AT,
                REMARKS
             FROM BOOKING_LOGS
             ORDER BY LOG_ID DESC`
        );

        const logs = result.rows.map(row => ({
            log_id: row[0],
            booking_id: row[1],
            old_status: row[2],
            new_status: row[3],
            changed_at: row[4],
            remarks: row[5]
        }));

        console.log(
            'Booking Logs fetched:',
            logs.map(log => log.log_id)
        );

        res.json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error('Booking Logs API Error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// POST CUSTOMER
app.post('/api/customers', async (req, res) => {
    let connection;

    try {
        const { customer_name, phone, email, address } = req.body;

        connection = await getConnection();

        await connection.execute(
            `INSERT INTO CUSTOMERS
                (CUSTOMER_NAME, PHONE, EMAIL, ADDRESS)
             VALUES
                (:customer_name, :phone, :email, :address)`,
            { customer_name, phone, email, address },
            { autoCommit: true }
        );

        res.status(201).json({
            success: true,
            message: 'Customer added successfully!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// DELETE CUSTOMER
app.delete('/api/customers/:id', async (req, res) => {
    let connection;

    try {
        const customerId = req.params.id;

        connection = await getConnection();

        const result = await connection.execute(
            `DELETE FROM CUSTOMERS
             WHERE CUSTOMER_ID = :customer_id`,
            { customer_id: customerId },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer deleted successfully!'
        });

    } catch (error) {
        console.error(error);

        if (error.errorNum === 2292) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete this customer because vehicles or bookings are linked to them.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// POST VEHICLE
app.post('/api/vehicles', async (req, res) => {
    let connection;

    try {
        const {
            customer_id,
            vehicle_number,
            brand,
            model,
            vehicle_type,
            manufacturing_year
        } = req.body;

        connection = await getConnection();

        await connection.execute(
            `INSERT INTO VEHICLES
                (CUSTOMER_ID, VEHICLE_NUMBER, BRAND, MODEL,
                 VEHICLE_TYPE, MANUFACTURING_YEAR)
             VALUES
                (:customer_id, :vehicle_number, :brand, :model,
                 :vehicle_type, :manufacturing_year)`,
            {
                customer_id,
                vehicle_number,
                brand,
                model,
                vehicle_type,
                manufacturing_year
            },
            { autoCommit: true }
        );

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// DELETE VEHICLE
app.delete('/api/vehicles/:id', async (req, res) => {
    let connection;

    try {
        const vehicleId = req.params.id;

        connection = await getConnection();

        const result = await connection.execute(
            `DELETE FROM VEHICLES
             WHERE VEHICLE_ID = :vehicle_id`,
            { vehicle_id: vehicleId },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully!'
        });

    } catch (error) {
        console.error(error);

        if (error.errorNum === 2292) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete this vehicle because bookings are linked to it.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// POST BOOKING
app.post('/api/bookings', async (req, res) => {
    let connection;

    try {
        const {
            customer_id,
            vehicle_id,
            service_id,
            service_date
        } = req.body;

        connection = await getConnection();

        await connection.execute(
            `BEGIN
                CREATE_BOOKING(
                    :customer_id,
                    :vehicle_id,
                    :service_id,
                    TO_DATE(:service_date, 'YYYY-MM-DD')
                );
             END;`,
            {
                customer_id,
                vehicle_id,
                service_id,
                service_date
            },
            { autoCommit: true }
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// POST INVOICE
app.post('/api/invoices', async (req, res) => {
    let connection;

    try {
        const { booking_id } = req.body;

        connection = await getConnection();

        await connection.execute(
            `BEGIN
                CREATE_INVOICE(:booking_id);
             END;`,
            {
                booking_id
            },
            { autoCommit: true }
        );

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) await connection.close();
    }
});

// POST PAYMENT
app.post('/api/payments', async (req, res) => {
    let connection;

    try {
        const { invoice_id } = req.body;

        connection = await getConnection();

        await connection.execute(
            `BEGIN
                UPDATE_PAYMENT(:invoice_id);
             END;`,
            {
                invoice_id
            },
            { autoCommit: true }
        );

        res.status(200).json({
            success: true,
            message: 'Payment updated successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// UPDATE BOOKING STATUS
app.post('/api/update-booking-status', async (req, res) => {
    let connection;

    try {
        const { booking_id, new_status } = req.body;

        connection = await getConnection();

        await connection.execute(
            `BEGIN
                UPDATE_BOOKING_STATUS(
                    :booking_id,
                    :new_status
                );
             END;`,
            {
                booking_id,
                new_status
            },
            { autoCommit: true }
        );

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
