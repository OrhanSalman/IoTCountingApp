import multiprocessing

class CustomProcess(multiprocessing.Process):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._pconn, self._cconn = multiprocessing.Pipe()
        self._exception = None

    def run(self):
        try:
            super().run()
            self._cconn.send(None)
        except Exception as e:
            self._cconn.send((type(e).__name__, str(e)))
        finally:
            self._pconn.close()
            self._cconn.close()

    @property
    def exception(self):
        if self._pconn.poll():
            self._exception = self._pconn.recv()
        return self._exception


# https://stackoverflow.com/questions/63758186/how-to-catch-exceptions-thrown-by-functions-executed-using-multiprocessing-proce