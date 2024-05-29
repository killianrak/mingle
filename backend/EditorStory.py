import asyncio
import openai
from dotenv import load_dotenv
import os
import uuid
import requests
import json
import shutil
import aiohttp
import time

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Récupérer la clé API depuis les variables d'environnement
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key="sk-proj-YfGDLGnoPBf4qE0sIQzrT3BlbkFJ6hY93YosyBXaTjxwLYqn")
leonardo_key = "d17b2876-2a94-4469-8967-bac686961876"
class EditorStory: 

  def __init__(self):
    self.__voice_path = ""
    self.__generated_images = []
    self.__image_text = ""
    
  async def generate_video(self):
    all_prompts = self.askForStory()
    await self.askForImages(all_prompts)

    await self.run_ffmpeg_command()
    
    
  def askForStory(self):
    
    prompts = []
    response_story = client.chat.completions.create(
      model="gpt-4-turbo",
      messages=[{'role': 'user', 'content': f"Raconte une histoire captivante et intrigante pour une vidéo TikTok d'une durée de maximum 01:10 minutes et minimum 01:00 minutes. L'histoire doit être adaptée à un public allant des adolescents aux adultes. L'histoire doit avoir un début rapide pour capter l'attention, un développement intrigant. Tu peux raconter des anecdotes insolites, une légende fascinante ou une histoire inventée suffisamment intéressante pour retenir l'attention des spectateurs. Assure-toi que le style et le ton de l'histoire soient en adéquation avec le thème choisi. Ne raconte que l'histoire sans titre à la fin et sans phrase de conclusion"}]
    )
    
    print(response_story.choices[0].message.content)
    minute, seconde = self.estimate_duration(response_story.choices[0].message.content)

    print(f"durée estimé: {minute}:{seconde}")
    
    response_image = client.chat.completions.create(
      model="gpt-4-turbo",
      messages=[{'role': 'user', 'content': f"Génère moi les prompts pour l'api midjourney afin d'illustrer cette histoire : {response_story.choices[0].message.content} sous forme de tableau json, avec pour chaques éléments du tableau les clefs start, qui dit quand l'image commence, end, quand elle termine, et prompt, le prompt associé avec 'start' et 'end' formatés en 'MM:SS'. Veuillez respecter strictement ce format et ne pas inclure de texte superfle avant ou après le tableau JSON, ne pas mettre le tableau entre guillements, ou le mot json juste avant.Chaques images ne doit pas dépasser 5secondes, donc génère une image pour toutes les 5 secondes de la vidéo.Générer assez d'image pour que la dernière soit à {minute}:{seconde}, pas moins."}]
    )
    
    print(response_image.choices[0].message.content)
    prompt_json = json.loads(response_image.choices[0].message.content)
    
    self.generate_voice(response_story)
    return prompt_json
  
  def generate_voice(self, response_story):
    output_voice = uuid.uuid4()
    self.__voice_path = f"voice_over/{output_voice}.mp3"
    story = response_story.choices[0].message.content
    with client.audio.speech.with_streaming_response.create(
      model="tts-1",
      voice="onyx",
      input=story,
      response_format="mp3"
    ) as response:
        response.stream_to_file(f"voice_over/{output_voice}.mp3")    
    
  def estimate_duration(self, text, words_per_minute=150):
      words = len(text.split())
      duration_minutes = words / words_per_minute
      minutes = int(duration_minutes)  # obtenir les minutes entières
      seconds = int((duration_minutes - minutes) * 60) + 5  # ajouter 5 secondes au résultat

      if seconds >= 60:  # si le nombre de secondes dépasse 60, ajuster les minutes
          minutes += seconds // 60
          seconds %= 60  # obtenir le reste des secondes après la division

      # Formatage des minutes et des secondes
      minutes_str = f"{minutes:02}"
      seconds_str = f"{seconds:02}"  # ajoute un zéro devant si les secondes sont inférieures à 10

      return minutes_str, seconds_str
  
  # def askForImages(self, prompt):

  #   # URL de l'API
  #   url = 'https://cloud.leonardo.ai/api/rest/v1/generations'

  #   # En-têtes de la requête
  #   headers = {
  #       'accept': 'application/json',
  #       'authorization': f'Bearer {leonardo_key}',
  #       'content-type': 'application/json'
  #   }

  #   # Données JSON pour la requête POST
  #   data = {
  #       "height": 1440,
  #       "prompt": prompt["prompt"],
  #       "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",  # Leonardo Kino XL model
  #       "width": 808,
  #       "alchemy": True,
  #       "presetStyle": "DYNAMIC",
  #       "photoReal": True,
  #       "photoRealVersion": "v2",
  #       "num_images": 1
  #   }

  #   # Effectuer la requête POST
  #   response = requests.post(url, headers=headers, data=json.dumps(data))

  #   # Vérifier la réponse
  #   if response.status_code == 200:
  #     while True:
  #       res = response.json()
  #       image_id = res["sdGenerationJob"]['generationId']
  #       print(image_id)
  #       response_image = requests.get(f"{url}/{image_id}", headers=headers)
     
  #       if response_image.status_code == 200:
  #         response_check = response_image.json()
  #         status = response_check["generations_by_pk"]["status"]
  #         print(status)
  #         if status == "COMPLETE":
  #           id = uuid.uuid4()
  #           print(response_check)

  #           image = {"path": f'generated_images/{id}.jpg', "start": prompt["start"], "end": prompt["end"]}
  #           self.__generated_images.append(image)
  #           url_image = response_check["generations_by_pk"]["generated_images"][0]["url"]
  #           download_image = requests.get(url_image, stream=True)
  #           with open(f'generated_images/{id}.jpg', 'wb') as f:
  #             shutil.copyfileobj(download_image.raw, f)
  #           break
  #       else:
  #         print("Failed:", response_image.status_code, response_image.text)
  #         break
        
  #   else:
  #       print("Failed:", response.status_code, response.text)
  
  async def fetch_image(self, session, prompt):
        url = 'https://cloud.leonardo.ai/api/rest/v1/generations'
        headers = {
            'accept': 'application/json',
            'authorization': f'Bearer {leonardo_key}',
            'content-type': 'application/json'
        }
        data = {
            "height": 1440,
            "prompt": prompt["prompt"],
            "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",  # Leonardo Kino XL model
            "width": 808,
            "alchemy": True,
            "presetStyle": "DYNAMIC",
            "photoReal": True,
            "photoRealVersion": "v2",
            "num_images": 1
        }
        
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                res = await response.json()
                image_id = res["sdGenerationJob"]['generationId']
                print(image_id)

                while True:
                    async with session.get(f"{url}/{image_id}", headers=headers) as response_image:
                        if response_image.status == 200:
                            response_check = await response_image.json()
                            status = response_check["generations_by_pk"]["status"]
                            print(status)
                            if status == "COMPLETE":
                                id = uuid.uuid4()
                                print(response_check)
                                
                                image = {"path": f'generated_images/{id}.jpg', "start": prompt["start"], "end": prompt["end"]}
                                self.__generated_images.append(image)
                                url_image = response_check["generations_by_pk"]["generated_images"][0]["url"]
                                
                                async with session.get(url_image) as download_image:
                                    with open(f'generated_images/{id}.jpg', 'wb') as f:
                                      while True:
                                        chunk = await download_image.content.read(1024)
                                        if not chunk:
                                          break
                                        f.write(chunk)
                                break
                        else:
                            print("Failed:", response_image.status, await response_image.text())
                            break
                    await asyncio.sleep(10)
            else:
                print("Failed:", response.status, await response.text()) 
                
  async def askForImages(self, prompts):
      async with aiohttp.ClientSession() as session:
          tasks = []
          for prompt in prompts:
              tasks.append(self.fetch_image(session, prompt))
          await asyncio.gather(*tasks)
  
  async def run_ffmpeg_command(self):
    id = uuid.uuid4()
    self.__image_text = f'{id}.txt'
    with open(f'{id}.txt', 'w') as file:
      for image in self.__generated_images:
        start_seconds = self.convert_to_seconds(image['start'])
        end_seconds = self.convert_to_seconds(image['end'])
        duration = start_seconds - end_seconds
        file.write(f"file '{image['path']}'\n")
        file.write(f"duration {abs(duration)}\n")
    # Pour la dernière image, il est nécessaire de répéter le fichier sans la durée
      file.write(f"file '{self.__generated_images[-1]['path']}'\n")
    
    command = [
        'ffmpeg', '-f', 'concat','-i', f'{id}.txt',
        '-i', self.__voice_path, '-c:v', 'h264_nvenc', '-c:a', 'aac', '-pix_fmt', 'yuv420p', 'assets/output.mp4'
    ]
    
    process = await asyncio.create_subprocess_exec(*command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    stdout, stderr = await process.communicate()
    
  async def fetch(self, session, url):
    async with session.get(url) as response:
        return await response.text()
      
  async def fetch_all(self, urls):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url in urls:
            tasks.append(self.fetch(session, url))
        results = await asyncio.gather(*tasks)
        return results
      
  def convert_to_seconds(self, time_str):
        minutes, seconds = map(int, time_str.split(':'))
        return minutes * 60 + seconds 
edit = EditorStory()
asyncio.run(edit.generate_video())