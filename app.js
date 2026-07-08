
const express = require('express');
const mysql = require('mysql2');
const app = express();

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
    extended:false
}));


// Define routes to retrive products from the databse and render them in the HTML page
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
app.get('/student/:id', (req, res) => {
    // Extract the student ID from the request parameters
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';
    // Fetch data from MySQL based on the student ID
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving student by ID');
        }
        
        if (results.length > 0) {
            // Format the dob for the found student
            const d = new Date(results[0].dob);
            results[0].dob = d.toISOString().split("T")[0];
            // Render HTML page with the student data
            res.render('student', { student: results[0] });
        

    
        } else {
            // If no student with the given ID was found
            res.send('Student not found');
        }
    });
});

app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});
app.post('/addStudent', (req, res) => {
    // Extract student data from the request body
    const { name, dob , contact , image } = req.body;
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
            // Render HTML page with the student data
            res.render('editStudent', { student: results[0] });
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
    // Insert the new product into the database
    connection.query(sql, [name, quantity, price, productId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating product:", error);
            res.send('Error updating product');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});
//define route to handle the deletion of a product by its id
app.get('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE productId = ?';
  connection.query( sql , [productId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting product:", error);
      res.send('Error deleting product');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)); 