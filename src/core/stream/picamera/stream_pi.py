import time
import cv2
import os
from src.utils.logger import Logger
import settings
from picamera2 import Picamera2
from src.core.stream.ffmpeg import convert_video

logger = Logger("PiCameraStream", settings.LOG_PATH + "/stream.log")

img_path = settings.IMG_PATH
vid_path = settings.VID_PATH


class CameraStream:
    def __init__(self, source, main_resolution, fps, stream_channel):
        self.resolution = main_resolution
        self.fps = fps
        self.source = source
        self.frame_times = []
        self.current_frame_time = 0
        self.frame_counter = 0
        self.stream_channel = stream_channel

        try:
            self.stream = Picamera2()
            if self.stream:
                
                if not self.stream_channel == "greyscale":
                    preview_config = self.stream.create_preview_configuration(
                    main={"size": self.resolution, "format": self.stream_channel},
                )
                else:
                    preview_config = self.stream.create_preview_configuration(
                    main={"size": self.resolution},
                    )
                    self.stream.set_controls({"Saturation": 0.0}) # Funktioniert nicht
                self.stream.set_controls({"FrameRate": self.fps})
                self.stream.configure(preview_config)
                self.stream.start()
        except Exception as e:
            error = f"Error initializing camera: {e}"
            logger.error(error)
            self.stream = None

    def __del__(self):
        if self.stream:
            self.stop_camera()

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.stream:
            self.stop_camera()

    #def isOpened(self):
    #    return self.stream is not None and self.stream.is_open()

    def isOpened(self):
        #return self.stream is not None and self.stream.is_open
        return self.stream is not None


    def get_details(self):
        return {
            "resolution": self.resolution,
            "fps": self.fps,
            "source": self.source
        }
    
    def read(self):
        if self.stream:
            try:
                start_time = time.time()
                frame = self.stream.capture_array()
                end_time = time.time()

                if frame is not None:
                    self.frame_counter += 1
                    frame_time = (end_time - start_time) * 1000
                    self.current_frame_time = frame_time
                    self.frame_times.append(frame_time)
                    return True, frame
                else:
                    error = "Failed to capture frame."
                    logger.error(error)
                    return False, error
            except Exception as e:
                error = f"Error capturing frame: {e}"
                logger.error(error)
                return False, error
        return False, "Camera stream is not initialized."

    
    def start_camera(self):
        if self.stream:
            self.stream.start()

    def stop_camera(self):
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
    """
    def reset_camera(self):
        if self.stream:
            self.stream.close()
            self.stream = None
    """

    def capture_image(self):
        if self.stream:
            try:
                frame = self.stream.capture_array()
                if frame is not None:
                    # Save image
                    cv2.imwrite(os.path.join(img_path, "capture.jpg"), frame)
                    #logger.info(f"Image saved successfully to {os.path.join(img_path, 'capture.jpg')}")
                    return True, frame
                else:
                    logger.error("Failed to capture image.")
                    return False, None
            except Exception as e:
                error = f"Error capturing image: {e}"
                logger.error(error)
                return False, error
        else:
            error = "Camera is not open."
            logger.error(error)
            return False, error


    def capture_video(self, duration):
        if self.stream:
            try:
                frame_width, frame_height = self.resolution
                size = (frame_width, frame_height)

                temp_video_path = os.path.join(vid_path, 'capture_temp.mp4')
                final_video_path = os.path.join(vid_path, 'capture.mp4')
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter(temp_video_path, fourcc, self.fps, size)

                expected_frames = int(duration * self.fps)
                frame_count = 0
                
                #start_time = time.time()
                #while time.time() - start_time < duration:
                while frame_count < expected_frames:
                    frame = self.stream.capture_array()
                    if frame is not None:
                        out.write(frame)
                        frame_count += 1
                    else:
                        error = "Failed to capture frame."
                        logger.error(error)
                        out.release()
                        return False, error

                out.release()
                #logger.info(f"Video saved successfully to {temp_video_path}")

                # Konvertiere das Video mit der convert_video-Funktion

                convert_video(temp_video_path, final_video_path)
                info = f"Video converted successfully to {final_video_path}"
                #logger.info(info)
                return True, "Video finished. You Can now run a simulation on the video."
            except Exception as e:
                error = f"Error capturing video: {e}"
                logger.error(error)
                return False, error
        else:
            error = "Camera is not open."
            logger.error(error)
            return False, error


    # Getter-Methoden
    def get_CAP_PROP_POS_MSEC(self):
        # Gibt die Zeit des aktuellen Frames in Millisekunden zurück
        return self.current_frame_time

    def get_CAP_PROP_POS_FRAMES(self):
        # Gibt die Anzahl der Frames zurück
        return self.frame_counter