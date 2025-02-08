const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Required for Python-Node communication
const app = express();
const PORT = 8000;

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

connectDB();

const Student = require('./models/student');

// Middleware
app.use(cors());  // Enable CORS for Python requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

app.get('/Admin', (req, res) => {
  res.render('admin', { title: 'Admin Portal' });
});

app.get('/Teacher', (req, res) => {
  res.render('teacher', { title: 'Teachers Portal' });
});

// Handle attendance from Python (Eel)
app.post('/Admin', async (req, res) => {
  try {
    let newStudent;
    let fileName = req.body.capturedImage || ''; // Python sends image path

    newStudent = new Student({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      picture: fileName,
    });

    await newStudent.save();
    res.send({ success: true, message: 'Attendance marked successfully' });
  } catch (err) {
    console.error('Error handling attendance submission:', err);
    res.status(500).send({ success: false, message: 'Failed to mark attendance' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
