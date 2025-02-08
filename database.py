from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["school"]
attendance_collection = db["attendance"]

def save_attendance(name, roll_number, timestamp):
    """Save attendance record in MongoDB"""
    attendance_collection.insert_one({
        "name": name,
        "roll_number": roll_number,
        "timestamp": timestamp
    })
