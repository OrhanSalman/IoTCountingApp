import json
import multiprocessing
import os
import sys
import threading
from ultralytics.utils.benchmarks import benchmark
import settings
from src.utils.logger import Logger
from datetime import datetime

from src.utils.logger import Logger

logger = Logger("Benchmark", settings.LOG_PATH + "/benchmark.log")

class ModelBenchmark:
    def __init__(self, deviceConfigId, model, imgsz, half, int8, device, data, verbose):
        self.deviceConfigId = deviceConfigId
        self.model = model
        self.imgsz = imgsz
        self.half = half
        self.int8 = int8
        self.device = device
        self.data = data
        self.verbose = verbose
        self.logger = Logger("Benchmark", settings.LOG_PATH + "/benchmark.log")
        self.active = True
        self.benchmark_active = multiprocessing.Event()

    def activate(self):
        self.benchmark_active.clear()
        self.active = True

    def deactivate(self):
        self.benchmark_active.set()
        self.active = False

    def run(self):
        while self.active and not self.benchmark_active.is_set():
            try:
                result = benchmark(model=self.model, imgsz=self.imgsz, half=self.half, int8=self.int8, device=self.device, data=self.data, verbose=self.verbose)
                self.logger.info(result)

                data = {}
                for key, items in result.items():
                    for index, item in enumerate(items):
                        if index not in data:
                            data[index] = {}
                        data[index][key] = str(item)

                string = f"Benchmarks complete for {self.model} with imgsz={self.imgsz}, half={self.half}, int8={self.int8}, device={self.device}"
                header = string

                content = {
                    "deviceConfigId": self.deviceConfigId,
                    "header": header,
                    "data": data,
                    "date": datetime.now().strftime("%d.%m.%Y - %H:%M:%S")
                }

                today = datetime.now().strftime("%d-%m-%Y")
                now = datetime.now().strftime("%H-%M-%S")
                filename = f"benchmark_{self.deviceConfigId}_{today}_{now}.json"

                file_path = os.path.join(settings.BENCHMARKS_PATH, filename)

                with open(file_path, 'w') as file:
                    json.dump(content, file, indent=4)
                
                return None
                
            except Exception as e:
                error = "Error while benchmarkinh: " + str(e)
                self.logger.error(error)
                raise Exception(error)
            finally:
                from src.env import manage_env_variable
                manage_env_variable("BENCHED", "True")
                self.deactivate()
        #if self.device != "cpu":
        #    return 0
        return None
