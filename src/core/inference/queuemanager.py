import queue
import threading
from collections import defaultdict
from src.utils.logger import Logger
lock = threading.RLock()


# Zwischenspeicher für unveröffentlichte Nachrichten, wenn kein Mongo Client existiert

class QueueManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.counts_history_queue = queue.Queue()

    def get_counts_history(self):
        counts_history = []
        with self.lock:
            while not self.counts_history_queue.empty():
                counts = self.counts_history_queue.get()
                counts_history.append(counts)
        return counts_history

    def save_counts(self, counts):
        with self.lock:
            self.counts_history_queue.put(counts)

    def get_counts_queue_size(self):
        with self.lock: 
            return self.counts_history_queue.qsize()
    
    def is_queue_empty(self):
        return self.counts_history_queue.empty()
