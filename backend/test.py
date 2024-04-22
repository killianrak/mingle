import asyncio


cmd = ['ffmpeg', '-i', 'assets/ea22b472-c0d8-4e2f-bb6c-b7c83c0fab19.mp4', '-c:v', 'libx264', '-crf', '23', '-preset', 'veryfast','-vsync', '2', '-vf', 'subtitles=subtitles_srt/ea22b472-c0d8-4e2f-bb6c-b7c83c0fab19.srt', '-c:a', 'copy', 'assets/7107c415-4024-4c95-9800-2734bb7b3e23.mp4']

async def run_subprocess(v):
        try:
            proc = await asyncio.create_subprocess_exec(*v, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
            output, errors = await proc.communicate() 
            await proc.wait()
            # print("Output :")
            # print(output)
            # print("Errors :")
            # print(errors)
            if proc.returncode != 0:
                print(f"Erreur lors de l'exécution de la commande: {errors.decode()}")
                raise Exception(f"Erreur lors de l'exécution de la commande: {errors.decode()}")
        except Exception as e:
            await proc.kill()
            await proc.wait()
            print(f"Exception lors de l'exécution du processus: {str(e)}")
            raise

        return output, errors


asyncio.run(run_subprocess(cmd))