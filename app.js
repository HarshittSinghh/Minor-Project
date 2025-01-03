const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

app.get('/Admin', (req, res) => {
  res.render('admin', { title: 'Admin Portal' });
});

app.get('/Teacher', (req, res) => {
  res.render('teacher', { title: 'Teachers Portal' });
});

// Handle form submission
app.post('/Admin', async (req, res) => {
  try {
    let newStudent;
    let fileName;

    if (req.body.capturedImage) {
      // Handle image captured from webcam
      const dataURL = req.body.capturedImage;
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
      fileName = `uploads/${Date.now()}.png`;
      const filePath = path.join(__dirname, 'public', fileName);

      // Save the base64 image to file
      fs.writeFileSync(filePath, base64Data, 'base64');

      newStudent = new Student({
        name: req.body.name,
        rollNumber: req.body.rollNumber,
        picture: fileName,
      });
    } else if (req.files && req.files.picture) {
      const sampleFile = req.files.picture;
      fileName = `uploads/${Date.now()}_${sampleFile.name}`;
      const uploadPath = path.join(__dirname, 'public', fileName);

      await sampleFile.mv(uploadPath);
      newStudent = new Student({
        name: req.body.name,
        rollNumber: req.body.rollNumber,
        picture: fileName,
      });
    } else {
      return res.status(400).send('No files or images were uploaded.');
    }
    await newStudent.save();

    res.redirect('/Admin');
  } catch (err) {
    console.error('Error handling form submission:', err);
    res.status(500).send('An error occurred while processing your request.');
  }
});
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
