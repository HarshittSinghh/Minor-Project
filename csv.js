const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const csvFilePath = path.join(__dirname, "attendance.csv");

function readCSVFile(callback) {
    let results = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
            console.log("Raw CSV Data:", results);
            callback(processStudentData(results));
        })
        .on("error", (err) => {
            console.error("Error reading CSV:", err);
            callback([]); 
        });
}

function processStudentData(data) {
    return data.map(student => {
        const attendanceRecords = Object.values(student).slice(1);

        const totalDays = attendanceRecords.length;
        const daysPresent = attendanceRecords.filter(status => status === "P").length;
        const daysAbsent = totalDays - daysPresent;
        const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

        return {
            name: student.Name,
            totalDays,
            daysPresent,
            daysAbsent,
            attendancePercentage
        };
    });
}

app.get("/students", (req, res) => {
    readCSVFile((students) => {
        console.log("Processed Student Data:", students);

        const studentNames = students.map(student => student.name);
        const attendancePercentages = students.map(student => student.attendancePercentage);

        res.render("student", { 
            students, 
            studentNames: JSON.stringify(studentNames), 
            attendancePercentages: JSON.stringify(attendancePercentages)
        });
    });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/students`));
