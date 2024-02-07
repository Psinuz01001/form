const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.');
});

db.run('CREATE TABLE campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)');

app.post('/api/campaign', (req, res) => {
    console.log('Received data:', req.body); 
    const data = req.body; 

    if (!data || !data.channels) {
        console.error("Missing required fields");
        return res.status(400).json({"error": "Missing required fields"});
    }

    db.run(`INSERT INTO campaigns(data) VALUES(?)`, [JSON.stringify(data)], function(err) {
        if (err) {
            console.error("Error inserting data:", err.message);
            res.status(500).json({"error": err.message});
            return;
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        });
    });
});

app.get('/api/campaigns', (req, res) => {
    db.all("SELECT * FROM campaigns", [], (err, rows) => {
        if (err) {
            res.status(500).json({"error": err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

app.get('/api/campaign/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM campaigns WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({"error": err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":row
        })
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
