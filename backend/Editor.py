from moviepy.editor import VideoFileClip
import subprocess

class Editor:

    def __init__(self, video_haute_path, video_basse_path):
        self.__largeur_cible = 1080
        self.__hauteur_cible = 1920
        self.__video_haute_path = video_haute_path
        self.__video_basse_path = video_basse_path
        self.__video_haute_clip = VideoFileClip(video_haute_path)
        self.__video_basse_clip = VideoFileClip(video_basse_path)
        self.__video_haute_duree = self.__video_haute_clip.duration
        self.__video_basse_duree = self.__video_basse_clip.duration
    
    def traitementVideo(self):
        if self.__video_basse_duree > self.__video_haute_duree:
            cut_cmd = [
                'ffmpeg',
                '-i', self.__video_basse_path,
                '-t', str(self.__video_haute_duree),
                '-c', 'copy',
                'assets/temp_basse_coupee.mp4'
            ]
            subprocess.run(cut_cmd, check=True)
            self.__video_basse_path = 'assets/temp_basse_coupee.mp4'

        elif self.__video_haute_duree > self.__video_basse_duree:
            print("Loop de la vidéo basse...")
            loop_cmd = [
                'ffmpeg',
                '-stream_loop', '-1',
                '-i', self.__video_basse_path,
                '-t', str(self.__video_haute_duree),
                '-c', 'copy', 
                'assets/temp_basse_boucle.mp4'
            ]
            subprocess.run(loop_cmd, check=True)
            self.__video_basse_path = 'assets/temp_basse_boucle.mp4'


    def divideEachXMinutes(self, x):

        # Durée minimale souhaitée pour chaque partie en secondes
        min_part_duration = x * 60  # x minutes

        # Initialiser les variables
        start_time = 0
        part_index = 1
        video_parts = []

        # Hauteur pour chaque moitié du cadre
        hauteur_moitié = self.__hauteur_cible // 2

        while start_time < self.__video_haute_duree:
            # Calculer le temps de fin pour la partie
            end_time = min(start_time + min_part_duration, self.__video_haute_duree)

            # Découper la partie de la vidéo
            output_video_path = f'assets/video_part_{part_index}.mp4'
            cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(start_time),
                '-to', str(end_time),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                output_video_path
        ]
            # Ajouter la partie à la liste
            video_parts.append(cmd)

            # Mettre à jour les variables pour la prochaine partie
            start_time = end_time
            part_index += 1
        # Fusionner les deux dernières parties si la dernière partie est inférieure à la durée minimale
        if float(video_parts[-1][8]) - float(video_parts[-1][6]) < min_part_duration and len(video_parts) >= 2:
            last_part = video_parts.pop()
            second_last_part = video_parts.pop()
            cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(second_last_part[6]),
                '-to', str(last_part[8]),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                output_video_path
            ]
            video_parts.append(cmd)

        # Sauvegarder chaque partie
        for v in video_parts:
            subprocess.run(v)

    def startNextVideoBeforeXSeconds(self, min_duration, x):
        # Durée minimale souhaitée pour chaque partie en secondes
        min_part_duration = min_duration * 60  # x minutes
        gap_between_parts = x
        # Initialiser les variables
        start_time = 0
        part_index = 1
        video_parts = []
        # Hauteur pour chaque moitié du cadre

        hauteur_moitié = self.__hauteur_cible // 2

        while start_time < self.__video_haute_duree:
            # Calculer le temps de fin pour la partie
            end_time = min(start_time + min_part_duration, self.__video_haute_duree)

            print(end_time)
            if part_index > 1:
                start_time -= gap_between_parts

            # Découper la partie de la vidéo
            output_video_path = f'assets/video_part_{part_index}.mp4'
            cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(start_time),
                '-to', str(end_time),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                output_video_path
            ]
            # Ajouter la partie à la liste
            video_parts.append(cmd)

            # Mettre à jour les variables pour la prochaine partie
            
            start_time = end_time 
            part_index += 1

        # Fusionner les deux dernières parties si la dernière partie est inférieure à la durée minimale
        if float(video_parts[-1][8]) - float(video_parts[-1][6]) < min_part_duration and len(video_parts) >= 2:
            last_part = video_parts.pop()
            second_last_part = video_parts.pop()
            cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(second_last_part[6]),
                '-to', str(last_part[8]),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                output_video_path
            ]
            video_parts.append(cmd)

        # Sauvegarder chaque partie
        for v in video_parts:
            subprocess.run(v)

            
    def divideWithCheckPoints(self, checkpointRanges):
        output_folder = 'assets/'

        hauteur_moitié = self.__hauteur_cible // 2
        
        for i, (start_time, end_time) in enumerate(checkpointRanges):
            output_video_path = f'{output_folder}video_part_{i+1}.mp4'
            cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(start_time),
                '-to', str(end_time),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                output_video_path
            ]
            subprocess.run(cmd, check=True)
            
        last_start_time = checkpointRanges[-1][1]  # Utiliser la fin du dernier checkpoint comme début
        last_end_time = self.__video_haute_duree  # Utiliser la fin de la vidéo comme fin
        last_output_video_path = f'{output_folder}video_part_{len(checkpointRanges)+1}.mp4'
        cmd = [
                'ffmpeg',
                '-i', self.__video_haute_path,
                '-i', self.__video_basse_path,
                '-ss', str(last_start_time),
                '-to', str(last_end_time),
                '-filter_complex',
                f"[0:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[haute];"
                f"[1:v]scale=-2:{hauteur_moitié},crop={self.__largeur_cible}:{hauteur_moitié}:(iw-{self.__largeur_cible})/2:(ih-{hauteur_moitié})/2[bas];"
                "[haute][bas]vstack",
                '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast',
                '-r', '60',  # Définir une fréquence d'images
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '5000k',
                last_output_video_path
            ]
        subprocess.run(cmd)

# s = Editor(1080, 1920, "assets/video_haute.mp4", "assets/video_basse.mp4")
# s.traitementVideo()
# s.startNextVideoBeforeXSeconds(5, 5)

        






