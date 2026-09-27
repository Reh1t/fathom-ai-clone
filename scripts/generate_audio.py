import json
import os
import subprocess
import time

VOICE_MAP = {
    'Sarah Chen (VP Product)': 'en-US-JennyNeural',
    'Marcus Johnson (Engineering)': 'en-US-GuyNeural',
    'Priya Patel (Design)': 'en-IN-NeerjaNeural',
    'David Kim (Marketing)': 'en-US-AriaNeural',
    'Rachel Torres (QA)': 'en-GB-SoniaNeural',
    'James Wright (DevOps)': 'en-AU-WilliamNeural',
    'Aisha Mohammed (Data)': 'en-NG-EzinneNeural',
    'Tom Bradley (Sales)': 'en-US-ChristopherNeural'
}

def check_dependencies():
    try:
        subprocess.run(['python', '-m', 'edge_tts', '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError:
        print("ERROR: edge-tts is not installed. Run: pip install edge-tts")
        exit(1)
        
    try:
        subprocess.run(['ffmpeg', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError:
        print("ERROR: ffmpeg is not installed or not on PATH.")
        exit(1)

def main():
    check_dependencies()
    
    transcript_file = os.path.join(os.path.dirname(__file__), 'launch_transcript.json')
    if not os.path.exists(transcript_file):
        print(f"ERROR: {transcript_file} not found.")
        exit(1)
        
    with open(transcript_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    transcripts = data.get('transcripts', [])
    if not transcripts:
        print("No transcripts found.")
        exit(1)
        
    output_dir = os.path.join(os.path.dirname(__file__), 'temp_audio')
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating 1-second silence file...")
    silence_file = os.path.join(output_dir, 'silence.mp3')
    if not os.path.exists(silence_file):
        # 24kHz is default for edge-tts
        subprocess.run([
            'ffmpeg', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', 
            '-t', '1', '-q:a', '9', '-acodec', 'libmp3lame', silence_file
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    file_list_path = os.path.join(output_dir, 'filelist.txt')
    
    print(f"Generating audio for {len(transcripts)} lines. This may take 10-15 minutes...")
    
    with open(file_list_path, 'w', encoding='utf-8') as flist:
        for i, line in enumerate(transcripts):
            voice = VOICE_MAP.get(line['speaker'], 'en-US-JennyNeural')
            text = line['text']
            
            # Escape quotes for edge-tts CLI
            text = text.replace('"', '\\"')
            
            audio_file = os.path.join(output_dir, f'line_{i:04d}.mp3')
            
            if not os.path.exists(audio_file):
                cmd = ['python', '-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', audio_file]
                try:
                    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                except subprocess.CalledProcessError as e:
                    print(f"Error generating line {i}: {e.stderr.decode()}")
                    continue
                
            flist.write(f"file '{os.path.basename(audio_file)}'\n")
            flist.write(f"file 'silence.mp3'\n")
            
            if (i + 1) % 50 == 0:
                print(f"Progress: {i + 1} / {len(transcripts)} lines generated.")
                
    print("Stitching files together with ffmpeg...")
    public_audio_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'audio')
    os.makedirs(public_audio_dir, exist_ok=True)
    
    final_output = os.path.join(public_audio_dir, 'launch-meeting.mp3')
    
    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', file_list_path, 
        '-c', 'copy', final_output
    ], cwd=output_dir)
    
    print(f"Success! Final audio saved to {final_output}")
    print("You can now safely delete the scripts/temp_audio directory.")

if __name__ == '__main__':
    main()
