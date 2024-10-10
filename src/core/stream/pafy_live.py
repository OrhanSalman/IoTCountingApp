import yt_dlp
# https://github.com/MichaelMarav/RealTimeDetectionYoutube

class StreamCatcher:
    def __init__(self):
        self.url = None
        self.ydl_opts = {
            'format': 'bestvideo[ext=mp4]',
        }
        self.video_url = None

        self.stream_resolution = None
        self.stream_fps = None

    def get_stream_values(self):
        return self.stream_resolution, self.stream_fps

    def set_url(self, url):
        self.url = url

    def get_url(self):
        return self.url
    
    def get_video_url(self):
        return self.video_url

    def get_formats(self):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            info = ydl.extract_info(self.url, download=False)
            formats = info['formats']

            video_formats = []
            for i, fmt in enumerate(formats):
                if 'acodec' not in fmt or fmt['acodec'] == 'none':
                    if 'height' in fmt:
                        if 'Premium' in fmt['format']:
                            continue
                        if '(storyboard)' in fmt['format']:
                            continue
                        #print(f"{i}: {fmt['format']} - Auflösung: {fmt['height']}p - FPS: {fmt['fps']}")
                        video_formats.append(f"{i}: {fmt['format']} - Auflösung: {fmt['height']}p - FPS: {fmt['fps']}")
            
            return video_formats

    def set_quality(self, choice):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            info = ydl.extract_info(self.url, download=False)

            formats = info['formats']

            self.video_url = formats[choice]['url']

            self.stream_resolution = f"{formats[choice]['height']}x{formats[choice]['width']}"
            self.stream_fps = formats[choice]['fps']
