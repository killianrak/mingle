import openai
from dotenv import load_dotenv
import os
import uuid
import requests
import json
import shutil
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
  def generate_video(self):
    all_prompts = self.askForStory()

    # for i in range(len(all_prompts)):
    self.askForImages(all_prompts[0]["prompt"])
    
    
  def askForStory(self):
    
    prompts = []
    response_story = client.chat.completions.create(
      model="gpt-4-turbo",
      messages=[{'role': 'user', 'content': f"Écris moi une histoire qui fait peur qui dure environ une minute et 10 secondes. La première phrase ne doit pas commencer par il était une fois, un jour, etc... ELle doit être captivante et intriguante."}]
    )
    

    minute, seconde = self.estimate_duration(response_story.choices[0].message.content)

    print(f"durée estimé: {minute}:{seconde}")
    
    response_image = client.chat.completions.create(
      model="gpt-4-turbo",
      messages=[{'role': 'user', 'content': f"Génère moi les prompts pour l'api midjourney afin d'illustrer cette histoire : {response_story.choices[0].message.content} sous forme de tableau json, avec pour chaques éléments du tableau les clefs start, qui dit quand l'image commence, end, quand elle termine, et prompt, le prompt associé avec 'start' et 'end' formatés en 'MM:SS'. Veuillez respecter strictement ce format et ne pas inclure de texte superfle avant ou après le tableau JSON, ne pas mettre le tableau entre guillements, ou le mot json juste avant.Chaques images peut faire entre 5 et 10 secondes.Générer assez d'image pour que la dernière soit à {minute}:{seconde}, pas moins."}]
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
  
  def askForImages(self, prompt):

    # URL de l'API
    url = 'https://cloud.leonardo.ai/api/rest/v1/generations'

    # En-têtes de la requête
    headers = {
        'accept': 'application/json',
        'authorization': f'Bearer {leonardo_key}',
        'content-type': 'application/json'
    }

    # Données JSON pour la requête POST
    data = {
        "height": 1440,
        "prompt": prompt,
        "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",  # Leonardo Kino XL model
        "width": 808,
        "alchemy": True,
        "presetStyle": "DYNAMIC",
        "photoReal": True,
        "photoRealVersion": "v2",
        "num_images": 1
    }

    # Effectuer la requête POST
    response = requests.post(url, headers=headers, data=json.dumps(data))

    # Vérifier la réponse
    if response.status_code == 200:
      while True:
        res = response.json()
        image_id = res["sdGenerationJob"]['generationId']
        print(image_id)
        response_image = requests.get(f"{url}/{image_id}", headers=headers)
     
        if response_image.status_code == 200:
          response_check = response_image.json()
          status = response_check["generations_by_pk"]["status"]
          print(status)
          if status == "COMPLETE":
            id = uuid.uuid4()
            print(response_check)

            self.__generated_images.append(f'generated_images/{id}.jpg')
            url_image = response_check["generations_by_pk"]["generated_images"][0]["url"]
            download_image = requests.get(url_image, stream=True)
            with open(f'generated_images/{id}.jpg', 'wb') as f:
              shutil.copyfileobj(download_image.raw, f)
            break
        else:
          print("Failed:", response_image.status_code, response_image.text)
          break
        
    else:
        print("Failed:", response.status_code, response.text)
      
edit = EditorStory()
edit.generate_video()