
import os.path
import whisper 

model = whisper.load_model("base")



# transcript = transcriber.transcribe("./my-local-audio-file.wav")

class Subtitles:
    def __init__(self, videos):
        self.__videos = videos
        self.__model = whisper.load_model("base")
    
    def subtitle(self):
        for index, v in enumerate(self.__videos):
            
            
            result = self.__model.transcribe(v)
            video_name = v.split("/")[1].split(".")[0]
            srt_content = generate_srt(result)
            print(srt_content)
            with open(f"{os.path.dirname(__file__)}/../subtitles_srt/{video_name}.srt", "w") as f:
                f.write(srt_content)
                
    def parseToSrt(self, transcribed):
        print(transcribed) #coder le parsing en srt
        
    import json

def generate_srt(data):
    srt_content = ''
    segment_id = 1
    
    for segment in data['segments']:
        start_time = format_time(segment['start'])
        end_time = format_time(segment['end'])
        text = segment['text'].strip()
        
        srt_content += f"{segment_id}\n"
        srt_content += f"{start_time} --> {end_time}\n"
        srt_content += f"{text}\n\n"
        
        segment_id += 1
    
    return srt_content

def format_time(seconds):
    hours = int(seconds / 3600)
    minutes = int((seconds % 3600) / 60)
    seconds = int(seconds % 60)
    milliseconds = int((seconds - int(seconds)) * 1000)
    
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"