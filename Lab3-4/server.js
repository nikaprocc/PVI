const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const port = process.env.PORT || 5000;

const app = express();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'veronika2005',
    database: 'studentsdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(__dirname));
app.use(bodyParser.json());

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.message);
    } else {
        console.log('Connected to MySQL database!');
        connection.release();
    }
});

pool.on('error', (err) => {
    console.error('MySQL database error:', err.message);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/students', (req, res) => {
    pool.query('SELECT * FROM student', (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ valid: false, message: 'Error occurred while fetching data from the database.' });
        }
        return res.status(200).json({ valid: true, data: results });
    });
});


app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'service-worker.js'));
});

app.post('/deleteConf', (req, res) => {
    console.log(req.body);
    const { id } = req.body;
    pool.query('DELETE FROM student WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ valid: false, message: 'Error occurred while deleting in database.' });
        }
        return res.status(200).json({ valid: true, message: 'Student deleted successfully.' });
    });
});

app.post('/confLogin', (req, res) => {
    console.log(req.body);
    const { name, password } = req.body;
    pool.query('SELECT name, password FROM login WHERE name = ? AND password = ?', [name, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ valid: false, message: 'Error occurred while querying the database.' });
        }
        if (results.length > 0) {
            return res.status(200).json({ valid: true, message: 'Student logged in successfully.' });
        } else {
            return res.status(200).json({ valid: false, message: 'Student hasn\'t been found' });
        }
    });
});

app.post('/formPost', (req, res) => {
    console.log(req.body);
    const { firstName, lastName, groupName, gender, birthDate, id } = req.body;

    if (!firstName || !lastName || !groupName || !gender || !birthDate) {
        const invalidFields = [];
        if (!firstName) invalidFields.push('firstName');
        if (!lastName) invalidFields.push('lastName');
        if (!groupName) invalidFields.push('groupName');
        if (!gender) invalidFields.push('gender');
        if (!birthDate) invalidFields.push('birthDate');
        return res.status(200).json({ valid: false, message: 'All fields are required.', invalidFields });
    }

    const regex = /^[a-zA-Z\s]*$/;
    if (!regex.test(firstName) || !regex.test(lastName)) {
        const invalidFields = [];
        if (!regex.test(firstName)) invalidFields.push('firstName');
        if (!regex.test(lastName)) invalidFields.push('lastName');
        return res.status(200).json({ valid: false, message: 'Name and lastname can only contain letters and spaces.', invalidFields });
    }

    const dob = new Date(birthDate);
    const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 16 || age > 70) {
        return res.status(200).json({ valid: false, message: 'Age must be between 16 and 70 years old.', invalidFields: ["birthDate"] });
    }

    pool.query('SELECT * FROM student WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ valid: false, message: 'Error occurred while querying the database.' });
        }
        if (results && results.length > 0) {
            pool.query('UPDATE student SET firstName = ?, lastName = ?, groupName = ?, gender = ?, birthDate = ? WHERE id = ?', [firstName, lastName, groupName, gender, birthDate, id], (updateError) => {
                if (updateError) {
                    console.error('Error updating record:', updateError);
                    return res.status(500).json({ valid: false, message: 'Error occurred while updating record.' });
                }
                return res.status(200).json({ valid: true, message: 'Record updated successfully.' });
            });
        } else {
            pool.query('INSERT INTO student (firstName, lastName, groupName, gender, birthDate, id) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, groupName, gender, birthDate, id], (insertError) => {
                if (insertError) {
                    console.error('Error executing query:', insertError);
                    return res.status(500).json({ valid: false, message: 'Error occurred while saving data to the database.' });
                }
                return res.status(200).json({ valid: true, message: 'Record saved successfully.' });
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
