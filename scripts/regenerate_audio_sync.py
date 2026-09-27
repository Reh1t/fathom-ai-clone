import os
import re
import subprocess
import json

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

def get_duration(file_path):
    cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file_path]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(result.stdout.strip())

def main():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    ts_file = os.path.join(base_dir, 'src', 'fixtures', 'transcripts.ts')
    
    with open(ts_file, 'r', encoding='utf-8') as f:
        ts_content = f.read()
        
    m5_match = re.search(r'const m5Transcript: TranscriptLine\[\] = \[(.*?)\];\s*export const transcripts', ts_content, re.DOTALL)
    if not m5_match:
        print("Could not find m5Transcript")
        exit(1)
        
    lines_str = m5_match.group(1)
    
    # Extract id, speaker, text
    pattern = r'\{\s*id:\s*"([^"]+)",\s*meetingId:\s*"m5",\s*speaker:\s*"([^"]+)",\s*text:\s*"([^"]+)",'
    matches = re.findall(pattern, lines_str)
    
    print(f"Found {len(matches)} lines for m5.")
    
    output_dir = os.path.join(os.path.dirname(__file__), 'temp_audio')
    os.makedirs(output_dir, exist_ok=True)
    
    silence_file = os.path.join(output_dir, 'silence.mp3')
    if not os.path.exists(silence_file):
        subprocess.run(['ffmpeg', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '1', '-q:a', '9', '-acodec', 'libmp3lame', silence_file], check=True)
        
    silence_duration = get_duration(silence_file)
    
    file_list_path = os.path.join(output_dir, 'filelist.txt')
    
    new_m5_lines = []
    current_time = 0.0
    
    with open(file_list_path, 'w', encoding='utf-8') as flist:
        for i, (line_id, speaker, text) in enumerate(matches):
            voice = VOICE_MAP.get(speaker, 'en-US-JennyNeural')
            audio_file = os.path.join(output_dir, f'line_{i:04d}.mp3')
            
            if not os.path.exists(audio_file):
                escaped_text = text.replace('"', '\\"')
                cmd = ['python', '-m', 'edge_tts', '--voice', voice, '--text', escaped_text, '--write-media', audio_file]
                try:
                    subprocess.run(cmd, check=True)
                except subprocess.CalledProcessError:
                    print(f"Error generating line {i}")
                    continue
                    
            duration = get_duration(audio_file)
            
            new_line = f'    {{ id: "{line_id}", meetingId: "m5", speaker: "{speaker}", text: "{text}", startTime: {current_time:.3f}, endTime: {(current_time + duration):.3f} }}'
            new_m5_lines.append(new_line)
            
            flist.write(f"file '{os.path.basename(audio_file)}'\n")
            flist.write(f"file 'silence.mp3'\n")
            
            current_time += duration + silence_duration
            
            if (i + 1) % 50 == 0:
                print(f"Progress: {i + 1} / {len(matches)} lines processed & measured.")
                
    # Stitch
    print("Stitching files together...")
    public_audio_dir = os.path.join(base_dir, 'public', 'audio')
    os.makedirs(public_audio_dir, exist_ok=True)
    final_output = os.path.join(public_audio_dir, 'launch-meeting.mp3')
    
    subprocess.run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', file_list_path, '-c', 'copy', final_output], cwd=output_dir, check=True)
    
    # Update transcripts.ts
    print("Patching transcripts.ts with exact durations...")
    new_m5_block = "const m5Transcript: TranscriptLine[] = [\n" + ",\n".join(new_m5_lines) + "\n];"
    
    new_ts_content = re.sub(r'const m5Transcript: TranscriptLine\[\] = \[.*?\];', new_m5_block, ts_content, flags=re.DOTALL)
    
    with open(ts_file, 'w', encoding='utf-8') as f:
        f.write(new_ts_content)
        
    print("Done! Perfectly synced audio and transcript.")

if __name__ == '__main__':
    main()
