import sounddevice as sd
import soundfile as sf
from gtts import gTTS

text = "Thank you"
tts = gTTS(text)
tts.save("thankyou.mp3")

def play_audio(file):
    data, samplerate = sf.read(file)
    sd.play(data, samplerate)
    sd.wait()

play_audio("thankyou.mp3")

print("Audio saved and played as thankyou.mp3")
