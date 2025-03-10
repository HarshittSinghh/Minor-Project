const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
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
app.use(cors());  
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
  res.render('index', { title: 'Markify' });
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
    console.log("Received Attendance Request:", req.body);
    console.log("Received Files:", req.files);

    if (!req.body.name || !req.body.rollNumber) {
      return res.status(400).send({ success: false, message: "Name and Roll Number are required" });
    }

    let fileName = "";

    // Format name and roll number (remove spaces & special characters)
    const formattedName = req.body.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const formattedRoll = req.body.rollNumber.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

    // File name format: Name_RollNumber
    const finalFileName = `${formattedName}_${formattedRoll}`;

    // If an image file is uploaded
    if (req.files && req.files.picture) {
      let picture = req.files.picture;
      fileName = `${finalFileName}${path.extname(picture.name)}`;
      let uploadPath = path.join(uploadsDir, fileName);

      console.log("Uploading file to:", uploadPath);

      // Move file to uploads folder
      await picture.mv(uploadPath);
    }

    // If a base64 image is sent
    if (req.body.capturedImage) {
      console.log("Base64 Image received");

      let base64Data = req.body.capturedImage.replace(/^data:image\/\w+;base64,/, "");
      fileName = `${finalFileName}.png`;
      let uploadPath = path.join(uploadsDir, fileName);

      console.log("Saving base64 image to:", uploadPath);

      // Write image file
      fs.writeFileSync(uploadPath, base64Data, 'base64');
    }

    // Create a new student entry
    const newStudent = new Student({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      picture: fileName, // Store only the filename in the database
    });

    await newStudent.save();
    console.log("Student saved successfully:", newStudent);

    res.send({ success: true, message: "Attendance marked successfully", fileName });
  } catch (err) {
    console.error("Error handling attendance submission:", err);
    res.status(500).send({ success: false, message: "Failed to mark attendance", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
