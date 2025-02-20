const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const secretKey = 't4sks_w4lls'

const PORT = 3001;

const authenticateToken = (req, res, next) =>
{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'walls_task'
});
// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as ID ' + db.threadId);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// LOGIN 
app.post("/login", async (req, res) => {
    
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username], async (err, result) => {
        if (err) {
            res.status(400).send('Error login!');
            return;
        }

        if (result.length == 0) {
            return res.status(401).send('Incorrect username or password');
        } 
        
        if (result[0] !== 'undefined') {
            if(!await bcrypt.compare(password, result[0].password)) {
                return res.status(401).send('Incorrect username or password');
            }
        }
        
        const token = jwt.sign({ username: result[0].username }, secretKey, { expiresIn: '1h' });
        res.json({ token });        
    });

});

// Routes

app.get("/api/tasks", authenticateToken, (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
      if (err) {
        res.status(500).send('Error fetching users');
        return;
      }
      res.json(results);
    });
});

app.post("/api/task", (req, res) => {
    const { title, content } = req.body;

    db.query('INSERT INTO tasks (title, content) VALUES (?, ?)', [title, content], (err, result) => {
        if (err) {
            res.status(400).send('Error creating task!');
            return;
        }
        res.status(201).send('Task created successfully');
    });
});

app.put('/api/task/:id', (req, res) => {
    const { title, content } = req.body;
    const taskId = req.params.id;
    db.query('UPDATE tasks SET title = ?, content = ? WHERE id = ?', [title, content, taskId], (err, result) => {
      if (err) {
        res.status(400).send('Error updating task');
        return;
      }
      res.send('Task updated successfully');
    });
});

app.delete('/api/task/:id', (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
      if (err) {
        res.status(400).send('Error deleting task');
        return;
      }
      res.send('Task deleted successfully');
    });
});