
import os.path
import whisper 

model = whisper.load_model("base")

from openai import OpenAI
client = OpenAI(api_key="sk-proj-79DE9LygeYhEYmcjplLJT3BlbkFJ9v5oinLluahN6qNWAQDo")


# transcript = transcriber.transcribe("./my-local-audio-file.wav")

class Subtitles:
    def __init__(self, videos):
        self.__videos = videos
        self.__model = whisper.load_model("base")
        self.__allFiles = []
        
    def subtitle(self):
        for index, v in enumerate(self.__videos):
            
            
            result = self.__model.transcribe(v, word_timestamps=True)
            print(result)
            video_name = v.split("/")[1].split(".")[0]
            srt_content = self.generate_ass_content(result)
            print(srt_content)
            with open(f"{os.path.dirname(__file__)}/../subtitles/{video_name}.ass", "w") as f:
                f.write(srt_content)
                file_srt  = f"{os.path.dirname(__file__)}/../subtitles/{video_name}.ass"
                print(file_srt)
                self.__allFiles.append(file_srt)
                
# def generate_srt(data):
#     srt_content = ''
#     segment_id = 1
    
#     for segment in data['segments']:
#         start_time = format_time(segment['start'])
#         end_time = format_time(segment['end'])
#         text = segment['text'].strip()
        
#         srt_content += f"{segment_id}\n"
#         srt_content += f"{start_time} --> {end_time}\n"
#         srt_content += f"{text}\n\n"
        
#         segment_id += 1
    
#     return srt_content

    def create_ass_header(self):
        """Crée l'en-tête du fichier ASS avec les styles de sous-titres."""
        return (
            "[Script Info]\n"
            "ScriptType: v4.00+\n"
            "Collisions: Normal\n"
            "PlayResX: 1920\n"
            "PlayResY: 1080\n"
            "WrapStyle: 0\n"
            "ScaledBorderAndShadow: yes\n\n"
            "[V4+ Styles]\n"
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
            "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
            "Alignment, MarginL, MarginR, MarginV, Encoding\n"
            "Style: Default, Space Comics, 32, &H00FFFFFF, &H00FFFFFF, &H00000000, &H800000, "
            "-1, 0, 0, 0, 100, 100, 0, 0, 4, 2, 10, 5, 10, 10, 10, 1\n\n"
            "[Events]\n"
            "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
        )
        
    # def generate_srt_by_words(self, data):
    #     srt_content = ''
    #     segment_id = 1
    #     word_buffer = []
    #     start_time = None
    #     end_time = None

    #     for segment in data['segments']:
    #         for word_info in segment['words']:
    #             current_word = word_info['word'].upper()

    #             # Gérer les mots qui commencent par une apostrophe uniquement s'ils sont au début du buffer
    #             if current_word.startswith("'") and not word_buffer:  # Buffer vide, mot commence par apostrophe
    #                 if srt_content.endswith("\n\n"):  # Assurez-vous que nous sommes à la fin d'un bloc
    #                     srt_content = srt_content.rstrip("\n\n") + current_word + "\n\n"
    #                 continue  # Passez au prochain mot sans l'ajouter au buffer actuel

    #             # Vérifier si le dernier mot se termine par un point pour démarrer un nouveau groupe
    #             if word_buffer and (word_buffer[-1].endswith('.') or word_buffer[-1].endswith('!') or word_buffer[-1].endswith('?')):
    #                 # Écrire le groupe actuel car le dernier mot se termine par un point
    #                 srt_content += f"{segment_id}\n"
    #                 srt_content += f"{self.format_time(start_time)} --> {self.format_time(end_time)}\n"
    #                 srt_content += ' '.join(word_buffer) + "\n\n"
    #                 segment_id += 1
    #                 word_buffer = []  # Réinitialiser pour le prochain groupe
    #                 start_time = word_info['start']

    #             if not word_buffer:  # Si le buffer est vide, définir le nouveau début de groupe
    #                 start_time = word_info['start']

    #             word_buffer.append(current_word)
    #             end_time = word_info['end']

    #             # Écrire le groupe s'il atteint quatre mots, et seulement s'il ne se termine pas par un point
    #             if len(word_buffer) == 4 and (not word_buffer[-1].endswith('.') or not word_buffer[-1].endswith('!') or not word_buffer[-1].endswith('?')):
    #                 srt_content += f"{segment_id}\n"
    #                 srt_content += f"{self.format_time(start_time)} --> {self.format_time(end_time)}\n"
    #                 srt_content += ' '.join(word_buffer) + "\n\n"
                    
    #                 segment_id += 1
    #                 word_buffer = []  # Réinitialiser le buffer pour le prochain groupe
    #                 start_time = None

    #     # Gérer le dernier groupe de mots s'il ne remplit pas complètement un groupe de quatre
    #     if word_buffer:
    #         srt_content += f"{segment_id}\n"
    #         srt_content += f"{self.format_time(start_time)} --> {self.format_time(end_time)}\n"
    #         srt_content += ' '.join(word_buffer) + "\n\n"

    #     return srt_content
    
    def generate_ass_content(self, data):
        """Génère le contenu ASS à partir des données de transcription."""
        ass_content = self.create_ass_header()
        segment_id = 1
        start_time = None
        end_time = None
        word_buffer = []

        for segment in data['segments']:
            for word_info in segment['words']:
                current_word = word_info['word'].upper()
                current_start = word_info['start']
                current_end = word_info['end']

                if current_word.startswith("'"):
                    # Si le mot commence par une apostrophe et le buffer est vide,
                    # on vérifie si le groupe précédent peut être mis à jour.
                    if not word_buffer and ass_content.endswith("\n\n"):
                        ass_content = ass_content.rstrip("\n\n") + current_word + "\n\n"
                        continue
                    elif word_buffer:
                        # Sinon, on l'ajoute au dernier mot du buffer actuel.
                        word_buffer[-1] += current_word
                        continue

                if word_buffer and (len(word_buffer) == 4 or word_buffer[-1].endswith(('.', '?', '!'))):
                    # Écrire le groupe actuel si le buffer est plein ou le dernier mot se termine par une ponctuation.
                    start_time_str = self.format_time_ass(start_time)
                    end_time_str = self.format_time_ass(end_time)
                    ass_content += f"Dialogue: 0,{start_time_str},{end_time_str},Default,,0,0,0,,{' '.join(word_buffer)}\n"
                    segment_id += 1
                    word_buffer = []  # Commencer un nouveau groupe

                if not word_buffer:
                    start_time = current_start  # Début du nouveau groupe

                word_buffer.append(current_word)
                end_time = current_end  # Fin du groupe actuel

        # Écrire le dernier groupe de mots s'il ne remplit pas complètement un groupe de quatre.
        if word_buffer:
            start_time_str = self.format_time_ass(start_time)
            end_time_str = self.format_time_ass(end_time)
            ass_content += f"Dialogue: 0,{start_time_str},{end_time_str},Default,,0,0,0,,{' '.join(word_buffer)}\n"

        return ass_content


    # def format_time(self, seconds):
    #     hours = int(seconds // 3600)
    #     minutes = int((seconds % 3600) // 60)
    #     seconds_int = int(seconds % 60)
    #     milliseconds = int((seconds - int(seconds)) * 1000)
        
    #     return f"{hours:02d}:{minutes:02d}:{seconds_int:02d},{milliseconds:03d}"

    def format_time_ass(self, seconds):
        """Formatte le temps en format ASS."""
        milliseconds = int(seconds * 1000)
        hours = milliseconds // 3600000
        minutes = (milliseconds % 3600000) // 60000
        seconds = (milliseconds % 60000) // 1000
        cs = (milliseconds % 1000) // 10  # Convertir les millisecondes en centièmes de seconde
        return f"{hours:01}:{minutes:02}:{seconds:02}.{cs:02}"

    def deleteSubtitlesFiles(self):
        for file_path in self.__allFiles:
            if os.path.exists(file_path):
                os.remove(file_path)

    def addSubtitle(self, video_file, ass_file, output_file):
        print("started")
        # Vérifier si les fichiers existent
        if not os.path.exists(video_file):
            print(f"Erreur: Le fichier vidéo {video_file} n'existe pas.")
            return
        if not os.path.exists(ass_file):
            print(f"Erreur: Le fichier SRT {ass_file} n'existe pas.")
            return

        # Options de style des sous-titres
        # style_options = (
        #     "ForceStyle='FontName=Arial,Fontsize=24,PrimaryColour=&HFFFFFF&,"
        #     "SecondaryColour=&H0000FF&,OutlineColour=&H000000&,BackColour=&H000000&,"
        #     "Bold=0,Italic=0,Outline=1,Shadow=1,BorderStyle=1,Alignment=2,MarginL=20,MarginR=20,MarginV=20'"
        # )

        # Utiliser FFmpeg pour ajouter les sous-titres à la vidéo avec le style personnalisé
        command = [
            'ffmpeg',
            '-i', video_file,
            '-vf', f"subtitles={ass_file}",
            '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
            '-c:a', 'copy',
            '-vsync', '2',
            output_file
        ]
        
        return command