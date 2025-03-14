const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const axios = require("axios");
const PORT = 8000;
app.use(express.static('public'));


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

app.use(cors());  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


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

const router = express.Router();
const EXTERNAL_SERVER_URL = "http://localhost:4000/students";
router.get("/student", async (req, res) => {
    try {
        const response = await axios.get(EXTERNAL_SERVER_URL);
        res.render("student", { students: response.data.students || [], title: "Student Portal" });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.render("student", { students: [], title: "Student Portal", error: "Failed to fetch data" });
    }
});
app.use("/", router);

app.post('/Admin', async (req, res) => {
  try {
    console.log("Received Attendance Request:", req.body);
    console.log("Received Files:", req.files);

    if (!req.body.name || !req.body.rollNumber) {
      return res.status(400).send({ success: false, message: "Name and Roll Number are required" });
    }

    let fileName = "";
    const formattedName = req.body.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const formattedRoll = req.body.rollNumber.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const finalFileName = `${formattedName}_${formattedRoll}`;

    if (req.files && req.files.picture) {
      let picture = req.files.picture;
      fileName = `${finalFileName}${path.extname(picture.name)}`;
      let uploadPath = path.join(uploadsDir, fileName);

      console.log("Uploading file to:", uploadPath);
      await picture.mv(uploadPath);
    }
    if (req.body.capturedImage) {
      console.log("Base64 Image received");

      let base64Data = req.body.capturedImage.replace(/^data:image\/\w+;base64,/, "");
      fileName = `${finalFileName}.png`;
      let uploadPath = path.join(uploadsDir, fileName);

      console.log("Saving base64 image to:", uploadPath);
      fs.writeFileSync(uploadPath, base64Data, 'base64');
    }

    const newStudent = new Student({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      picture: fileName,
    });

    await newStudent.save();
    console.log("Student saved successfully:", newStudent);

    res.send({ success: true, message: "Attendance marked successfully", fileName });
  } catch (err) {
    console.error("Error handling attendance submission:", err);
    res.status(500).send({ success: false, message: "Failed to mark attendance", error: err.message });
  }
});

// const loadCSVData = () => {
//   return new Promise((resolve, reject) => {
//       let data = [];
//       fs.createReadStream(path.join(__dirname, 'Attendance.csv')) 
//           .pipe(csv())
//           .on('data', (row) => {
//               const student = {
//                   name: row['Name'], 
//                   rollNumber: row['Roll Number'],
//                   totalDays: Object.keys(row).length - 2,
//                   daysPresent: Object.values(row).filter(value => value.trim() === 'P').length,
//                   daysAbsent: Object.values(row).filter(value => value.trim() === 'A').length,
//                   attendancePercentage: ((Object.values(row).filter(value => value.trim() === 'P').length / (Object.keys(row).length - 2)) * 100).toFixed(2)
//               };
//               data.push(student);
//           })
//           .on('end', () => {
//               console.log('CSV file successfully processed');
//               resolve(data);
//           })
//           .on('error', (error) => reject(error));
//   });
// };
// app.get('/student', async (req, res) => {
//   try {
//       studentsData = await loadCSVData();
//       res.render('student', { students: studentsData });
//   } catch (error) {
//       res.status(500).send('Error loading student data');
//   }
// });


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
