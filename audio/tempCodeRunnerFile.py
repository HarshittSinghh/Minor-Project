from gtts import gTTS  
from playsound import playsound  

text = "Thank you"
tts = gTTS(text)
tts.save("thankyou.mp3")
playsound("thankyou.mp3")

print("Audio saved and played as thankyou.mp3")
