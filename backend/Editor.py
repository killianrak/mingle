import asyncio
from fastapi import HTTPException
from moviepy.editor import VideoFileClip
import subprocess
import os
import zipfile
from fastapi.responses import FileResponse
import uuid 

class Editor:


    def __init__(self, video_haute_path, video_basse_path):
        self.__delete_videos = []
        self.__largeur_cible = 1080
        self.__hauteur_cible = 1920
        self.__cutted_videos = []
        self.__video_haute_path = video_haute_path
        self.__video_basse_path = video_basse_path
        self.__video_haute_clip = VideoFileClip(video_haute_path)
        self.__video_basse_clip = VideoFileClip(video_basse_path)
        self.__video_haute_duree = self.__video_haute_clip.duration
        self.__video_basse_duree = self.__video_basse_clip.duration
   
    def traitementVideo(self):
        id = uuid.uuid4()
        
        if self.__video_basse_duree > self.__video_haute_duree:
            cut_cmd = [
                'ffmpeg',
                '-i', self.__video_basse_path,
                '-t', str(self.__video_haute_duree),
                '-c', 'copy',
                f'assets/{id}.mp4'
            ]
            subprocess.run(cut_cmd,check=True)
            os.remove(self.__video_basse_path)
            self.__video_basse_path = f'assets/{id}.mp4'
            self.__delete_videos.append(f'assets/{id}.mp4')

        elif self.__video_haute_duree > self.__video_basse_duree:
            print("Loop de la vidéo basse...")
            loop_cmd = [
                'ffmpeg',
                '-stream_loop', '-1',
                '-i', self.__video_basse_path,
                '-t', str(self.__video_haute_duree),
                '-c', 'copy', 
                f'assets/{id}.mp4'
            ]
            subprocess.run(loop_cmd,check=True)
            os.remove(self.__video_basse_path)
            print("video removed")
            self.__video_basse_path = f'assets/{id}.mp4'
            self.__delete_videos.append(f'assets/{id}.mp4')
        self.__delete_videos.append(self.__video_basse_path)

    def downloadVideos(self, videos):

        zip_filename = f'assets/{uuid.uuid4()}.zip'
        with zipfile.ZipFile(zip_filename, 'w') as zip_file:
            # Ajouter chaque vidéo au fichier zip
            for v in videos:
                zip_file.write(v, os.path.basename(v))

        # Supprimer les fichiers individuels après les avoir ajoutés au zip
        for v in videos:
            os.remove(v)

        return zip_filename
    
    def clearAll(self):
        for file_path in self.__delete_videos:
            if os.path.exists(file_path):
                os.remove(file_path)
                
    async def divideEachXMinutes(self, x):
        print("traitement...")
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
            output_video_path = f'assets/{uuid.uuid4()}.mp4'
            self.__cutted_videos.append(output_video_path)
            #self.__delete_videos.append(output_video_path)
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
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
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
            self.__cutted_videos.pop()
            second_last_part = video_parts.pop()
            self.__cutted_videos.pop()
            last_output_video_path = f'assets/{uuid.uuid4()}.mp4'
            #self.__delete_videos.append(last_output_video_path)
            self.__cutted_videos.append(last_output_video_path)
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
                '-profile:v', 'high',  # Profil de l'encodeur
                '-level', '4.2',  # Niveau de l'encodeur
                '-vsync', '2', 
                '-b:v', '1000k',
                last_output_video_path
            ]
            video_parts.append(cmd)

        results = await asyncio.gather(*(self.run_subprocess(v) for v in video_parts))
        os.remove(self.__video_haute_path)
        zip_filename = self.downloadVideos(self.__cutted_videos)
        self.__delete_videos.append(zip_filename)
        return FileResponse(zip_filename, media_type='application/zip', filename=zip_filename)

    async def run_subprocess(self, v):
        proc = await asyncio.create_subprocess_exec(*v, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        output, errors = await proc.communicate()
        return output, errors

    async def startNextVideoBeforeXSeconds(self, min_duration, x):
        
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
                if gap_between_parts < start_time:
                    start_time -= gap_between_parts
                else:
                    self.clearAll()
                    os.remove(self.__video_haute_path)
                    raise HTTPException(status_code=422, detail="Veuillez spécifier un gap ingérieur à la durée de la vidéo")

            # Découper la partie de la vidéo
            output_video_path = f'assets/{uuid.uuid4()}.mp4'
            self.__cutted_videos.append(output_video_path)
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
            self.__cutted_videos.pop()
            second_last_part = video_parts.pop()
            self.__cutted_videos.pop()
            last_output_video_path = f'assets/{uuid.uuid4()}.mp4'
            self.__cutted_videos.append(last_output_video_path)
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
                last_output_video_path
            ]
            video_parts.append(cmd)

        # Sauvegarder chaque partie
        results = await asyncio.gather(*(self.run_subprocess(v) for v in video_parts))
        os.remove(self.__video_haute_path)
        zip_filename = self.downloadVideos(self.__cutted_videos)
        self.__delete_videos.append(zip_filename)
        return FileResponse(zip_filename, media_type='application/zip', filename=zip_filename)            
    async def divideWithCheckPoints(self, checkpointRanges): #[300, 600, 900]
        output_folder = 'assets/'
        video_parts = []
        hauteur_moitié = self.__hauteur_cible // 2
        start_time = 0
        
        for end_time in checkpointRanges:
            if float(end_time) > self.__video_haute_duree:
                self.clearAll()
                os.remove(self.__video_haute_path)
                raise HTTPException(status_code=422, detail="Vous avez spécifié un cut time supérieur à la durée de la vidéo.")
            output_video_path = f'{output_folder}{uuid.uuid4()}.mp4'
            self.__cutted_videos.append(output_video_path)
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
            start_time = end_time
            video_parts.append(cmd)
            #subprocess.run(cmd, check=True)
            
        last_start_time = checkpointRanges[-1]  # Utiliser la fin du dernier checkpoint comme début
        last_end_time = self.__video_haute_duree  # Utiliser la fin de la vidéo comme fin
        if float(last_start_time) < last_end_time:
            last_output_video_path = f'{output_folder}{uuid.uuid4()}.mp4'
            self.__cutted_videos.append(last_output_video_path)
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
            video_parts.append(cmd)
        results = await asyncio.gather(*(self.run_subprocess(v) for v in video_parts))
        os.remove(self.__video_haute_path)
        zip_filename = self.downloadVideos(self.__cutted_videos)
        self.__delete_videos.append(zip_filename)
        return FileResponse(zip_filename, media_type='application/zip', filename=zip_filename)


  






