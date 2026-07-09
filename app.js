
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


// Create MySQL connection 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RP738964$',
    database: 'c237_studentlistapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine 
app.set('view engine', 'ejs');
//  enable static files 
app.use(express.static('public'));
//enable form processing
app.use(express.urlencoded({
    extended: false
}));


// Define routes to retrive students from the databse and render them in the HTML page
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM student';
    // Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving students');
        }
        // Format each dob into yyyy-mm-dd
        results.forEach(student => {
            const d = new Date(student.dob);
            student.dob = d.toISOString().split("T")[0];
            // Example: "2007-05-08"
        });
        // Render HTML page with data
        res.render('index', { student: results });
    });
});
//define route to retrieve a single student by its ID and render it in the HTML page
// Show details for one student
app.get('/student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }

        if (results.length > 0) {
            const student = results[0];
            // Format DOB for display
            student.dob = new Date(student.dob).toISOString().split("T")[0];
            // Render the details page
            res.render('student', { student });
        } else {
            res.send('Student not found');
        }
    });
});


app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});
app.post('/addStudent', upload.single('image'), (req, res) => {
    // Extract student data from the request body
    const { name, dob, contact } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
    // Insert the new student into the database
    connection.query(sql, [name, dob, contact, image], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding student:", error);
            res.send('Error adding student');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

//define route to retrieve a single student by their id and render it in the HTML page for editing
app.get('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';
    // Fetch data from MySQL based on the student ID
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }
        // Check if any student with the given ID was found
        if (results.length > 0) {
            // Format DOB for <input type="date">
            const student = results[0];
            student.dob = student.dob.toISOString().split("T")[0]; //format to yyyy-mm-dd

            // Render HTML page with the student data
            res.render('editStudent', { student: student });
        } else {
            // If no student with the given ID was found, render a 404 page or handle it accordingly
            res.send('Student not found');
        }
    });
});
//define route to handle the form submission for editing a student
app.post('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    // Extract student data from the request body
    const { name, dob, contact } = req.body;
    const sql = 'UPDATE student SET name = ? , dob = ?, contact = ? WHERE studentId = ?';
    // Insert the new student into the database
    connection.query(sql, [name, dob, contact, studentId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating student:", error);
            res.send('Error updating student');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});
//define route to handle the deletion of a student by their id
app.get('/deleteStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM student WHERE studentId = ?';
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting student:", error);
            res.send('Error deleting student');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)); 