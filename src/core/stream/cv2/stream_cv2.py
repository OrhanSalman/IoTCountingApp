import time
import cv2
import os
from src.utils.logger import Logger
import settings
from src.core.stream.ffmpeg import convert_video

logger = Logger("cv2CameraStream", settings.LOG_PATH + "/stream.log")

img_path = settings.IMG_PATH
vid_path = settings.VID_PATH


class CameraStream:
    def __init__(self, source, main_resolution, fps, stream_channel):
        self.resolution = main_resolution
        self.fps = fps
        self.source = source
        self.stream_channel = stream_channel

        #if source is not type(int): oder
        #if not isinstance(source, int):
        #self.source = self.list_available_cameras()


        try:
            self.stream = cv2.VideoCapture(source)
            self.stream.set(cv2.CAP_PROP_FRAME_WIDTH, main_resolution[0])
            self.stream.set(cv2.CAP_PROP_FRAME_HEIGHT, main_resolution[1])
            self.stream.set(cv2.CAP_PROP_FPS, fps)
            self.stream.set(cv2.COLOR_RGB2YUV_I420, 1)
            #self.stream.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            actual_width = self.stream.get(cv2.CAP_PROP_FRAME_WIDTH)
            actual_height = self.stream.get(cv2.CAP_PROP_FRAME_HEIGHT)
            actual_fps = self.stream.get(cv2.CAP_PROP_FPS)
            
            ## auto focus
            #self.stream.set(cv2.CAP_PROP_AUTOFOCUS, 1)
            ## hdr
            #self.stream.set(cv2.CAP_PROP_AUTO_EXPOSURE, 1)
            #
            ## brightness
            #self.stream.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)
            ## contrast
            #self.stream.set(cv2.CAP_PROP_CONTRAST, 0.5)
            ## saturation
            #self.stream.set(cv2.CAP_PROP_SATURATION, 0.5)
            ## hue
            #self.stream.set(cv2.CAP_PROP_HUE, 0.5)
            ## gain
            #self.stream.set(cv2.CAP_PROP_GAIN, 0.5)
            ## exposure
            #self.stream.set(cv2.CAP_PROP_EXPOSURE, 0.5)
            
            
            
            if not self.stream.isOpened():
                raise RuntimeError("Could not open camera.")
            else:
                logger.info(f"Camera opened successfully. Resolution: {actual_width}x{actual_height}, FPS: {actual_fps}")
        except Exception as e:
            logger.error(f"Error initializing camera: {e}")
            self.stream = None
            raise e

    def __del__(self):
        self.stop_camera()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop_camera()
        
    def isOpened(self):
        return self.stream is not None and self.stream.isOpened()

    def get_details(self):
        return {
            "resolution": (self.stream.get(cv2.CAP_PROP_FRAME_WIDTH), self.stream.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "fps": self.stream.get(cv2.CAP_PROP_FPS),
            "source": self.source
        }

    def list_available_cameras(self):
        for i in range(0, 4):
            cap = cv2.VideoCapture(i)
            if cap is not None and cap.isOpened():
                logger.info(f"Camera {i} is available.")
                cap.release()
                return i

    def read(self):
        if self.stream:
            return self.stream.read()
        return None
    
    def start_camera(self): # redundant
        if self.stream:
            #self.stream.open(self.source)
            return self.stream.read()
        
    def stop_camera(self):
        if self.stream:
            self.stream.release()
            self.stream = None
    """
    def reset_camera(self):
        if self.stream:
            self.stream.release()
            self.stream = None
    """
    def capture_image(self):
        self.ret, self.frame = self.stream.read()
        if not self.ret:
            raise RuntimeError("Could not read image from camera.")
        
        frame = self.convert_color(self.frame)
        cv2.imwrite(img_path + "/capture.jpg", frame)
        
        return self.ret, self.frame
    
    
    def capture_video(self, duration):
        frame_width = int(self.stream.get(3))
        frame_height = int(self.stream.get(4))
        size = (frame_width, frame_height)

        temp_video_path = os.path.join(vid_path, 'capture_temp.mp4')
        final_video_path = os.path.join(vid_path, 'capture.mp4')
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_video_path, fourcc, self.fps, size)

        start_time = time.time()
        while time.time() - start_time < duration:
            ret, frame = self.stream.read()
            if not ret:
                logger.error("Could not read frame from camera.")
                return False
            out.write(frame)

        out.release()
        #logger.info(f"Video saved successfully to {temp_video_path}")

        # Konvertiere das Video mit der convert_video-Funktion
        try:
            convert_video(temp_video_path, final_video_path)
            info = f"Video converted successfully to {final_video_path}"
            #logger.info(info)
        except RuntimeError as e:
            logger.error(str(e))
            return False, str(e)

        # Lösche die temporäre Datei
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

        return True, "Video finished. You Can now run a simulation on the video."
      
    def get_timestamp(self):
        return time.time()
    
    def get_CAP_PROP_POS_MSEC(self):
        return self.stream.get(cv2.CAP_PROP_POS_MSEC)
    
    def get_CAP_PROP_POS_FRAMES(self):
        return self.stream.get(cv2.CAP_PROP_POS_FRAMES)

    def convert_color(self, frame):
        if frame is None:
            print("Frame is None.")
        if not frame.any():
            print("Frame is empty.")
        if self.stream_channel == "RGB888":
            pass
        elif self.stream_channel == "BGR888":
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        elif self.stream_channel == "greyscale":
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        else:
            pass
        return frame

    def reset_CAP_PROP_POS_MSEC(self):
        self.stream.set(cv2.CAP_PROP_POS_MSEC, 0)
        return self.stream.get(cv2.CAP_PROP_POS_MSEC)