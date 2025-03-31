import cv2
import numpy as np
import face_recognition
import os
import pandas as pd
import time
from datetime import datetime
from plyer import notification  
import pygame  

pygame.mixer.init()

def play_audio(file_path):
    """Play audio from the given file path."""
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()


audio_success = 'audio/thankyou.mp3'
audio_not_found = 'audio/face_mismatched.mp3'
audio_unrecognized = 'audio/face_mismatched.mp3'

path = 'public/uploads'
images = []
classNames = []
rollNumbers = []
myList = os.listdir(path)

for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    images.append(curImg)

    name, _ = os.path.splitext(cl)
    parts = name.split('_')
    
    if len(parts) > 1:
        classNames.append(parts[0])  
        rollNumbers.append(parts[1])  
    else:
        classNames.append(name)
        rollNumbers.append("Unknown")

print(f"Loaded Classes: {classNames} with Roll Numbers: {rollNumbers}")

def findEncodings(images):
    encodeList = []
    
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(img)

        if len(encodings) > 0:
            encodeList.extend(encodings)  
    
    return encodeList

def markAttendance(name):
    """Mark attendance and play success audio."""
    current_time = time.time()
    
    if name in last_attendance_time and (current_time - last_attendance_time[name]) < 30:
        return  

    last_attendance_time[name] = current_time  

    now = datetime.now()
    dateString = now.strftime('%Y-%m-%d')

    csv_file = "Attendance.csv"
    
    if not os.path.exists(csv_file):
        df = pd.DataFrame(columns=['Name'])
        df.to_csv(csv_file, index=False)

    df = pd.read_csv(csv_file)
    
    if 'Name' not in df.columns:
        df.insert(0, 'Name', '')
    
    if dateString not in df.columns:
        df[dateString] = 'A'

    if name in df['Name'].values:
        df.loc[df['Name'] == name, dateString] = 'P'
    else:
        new_entry = pd.DataFrame({'Name': [name], dateString: ['P']})
        df = pd.concat([df, new_entry], ignore_index=True)

    df.to_csv(csv_file, mode='w', header=True, index=False)

    notification.notify(
        title="Attendance Marked",
        message=f"{name} marked present for {dateString}",
        timeout=5
    )

    print(f"Attendance marked for {name}")
    play_audio(audio_success) 

print("Encoding Faces...")
encodeListKnown = findEncodings(images)
print("Encoding Complete")

last_attendance_time = {}  

cap = cv2.VideoCapture(0)
tolerance = 0.4  

while True:
    success, img = cap.read()
    
    if not success:
        print("Failed to grab frame.")
        play_audio(audio_not_found)
        break

    imgS = cv2.resize(img, (0, 0), None, 0.5, 0.5)  
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    imgS = cv2.GaussianBlur(imgS, (3, 3), 0)

    facesCurFrame = face_recognition.face_locations(imgS)
    encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

    face_detected = False
    face_recognized = False

    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        face_detected = True
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        
        if len(faceDis) > 0 and np.min(faceDis) < tolerance:
            face_recognized = True
            matchIndex = np.argmin(faceDis)
            name = classNames[matchIndex].upper()
        else:
            name = "Unknown"

        y1, x2, y2, x1 = faceLoc
        y1, x2, y2, x1 = y1 * 2, x2 * 2, y2 * 2, x1 * 2  

        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)  
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        cv2.rectangle(img, (x1, y2 - 35), (x2, y2), color, cv2.FILLED)
        cv2.putText(img, f"{name}", (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)

        if name != "Unknown":
            markAttendance(name)
        else:
            play_audio(audio_unrecognized)

    if not face_detected:
        play_audio(audio_not_found)
    elif face_detected and not face_recognized:
        play_audio(audio_unrecognized)

    cv2.imshow('Webcam', img)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):  
        break

cap.release()
cv2.destroyAllWindows()
