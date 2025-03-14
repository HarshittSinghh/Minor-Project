# Face Recognition Attendance System

## Overview
This project is a **Face Recognition-Based Attendance System** that uses **OpenCV and face_recognition** in Python for detecting and recognizing faces and **Node.js with Express and MongoDB** for managing attendance records. The system captures images, recognizes faces, and marks attendance in a CSV file.

## Features
- Face detection and recognition using **OpenCV** and **face_recognition**.
- Stores attendance details in a **CSV file**.
- Web-based backend built with **Node.js and Express.js**.
- File upload functionality for storing images.
- Uses **MongoDB** for backend storage.
- **Notification system** to alert users when attendance is marked.

---

## Tech Stack
### Python Packages:
The following Python packages are used in this project:
```txt
opencv-python
numpy
face-recognition
pandas
time
datetime
plyer
```

### Node.js Packages:
The following Node.js packages are required:
```txt
express
mongoose
body-parser
express-fileupload
path
fs
cors
```

---

## Installation & Setup

### Prerequisites:
- Python 3.x
- Node.js & npm
- MongoDB


### Setting up Node.js Backend:
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install the required Node.js packages:
   ```sh
   npm install express mongoose body-parser express-fileupload cors fs path
   ```
3. Start the server:
   ```sh
   node server.js
   ```

Your backend will now be running on **http://localhost:8000**

---

## Usage
1. **Upload images** of students in `public/uploads`.
2. **Run the Python script** to start face recognition.
3. Attendance will be **recorded in the CSV file** and stored in MongoDB.
4. **Notifications** will be sent upon successful attendance marking.

---

## Contributing
Feel free to contribute by forking the repository and submitting a pull request.

---
## Author
Harshit Kumar Singh
---

## License
This project is open-source under the MIT License.
