FROM debian:bookworm

RUN apt update && apt install -y --no-install-recommends gnupg

RUN echo "deb http://archive.raspberrypi.org/debian/ bookworm main" > /etc/apt/sources.list.d/raspi.list \
  && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 82B129927FA3303E

RUN apt update && apt -y upgrade

RUN apt update && apt install -y --no-install-recommends \
  gcc \
  procps \
  build-essential \
  #libglib2.0-0 \
  #libgl1-mesa-glx \
  #libjpeg-dev \
  #libtiff-dev \
  ffmpeg \
  v4l-utils \
  usbutils \
  python3-venv \
  python3-pip \
  python3-picamera2 \
  python3-dev \
  #libopenblas-dev \
  #libblas-dev \
  #libboost-all-dev \
  python3-prctl \
  libatlas-base-dev \
  libopenjp2-7\
  curl \
  wget \
  pkg-config \
  libhdf5-dev && \
  apt-get clean && \
  apt-get autoremove && \
  rm -rf /var/cache/apt/archives/* && \
  rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------------------------------------
# Build and run application
# ------------------------------------------------------------------------------------------------

WORKDIR /

COPY requirements.txt .


RUN python3 -m venv --system-site-packages /venv && \
  /venv/bin/pip install --no-cache-dir -r requirements.txt && \
  /venv/bin/pip cache purge && \
  rm -rf /root/.cache/pip


COPY . .

#RUN useradd -m iot-container-user && \
#  usermod -aG video iot-container-user && \
#  mkdir -p ./mongo_config ./mongo_data ./runs ./data ./logs ./datasets ./imgs ./vids ./counts_history ./tracking_history ./benchmarks && \
#  chown -R iot-container-user:iot-container-user ./mongo_config ./mongo_data ./runs ./data ./datasets ./logs ./imgs ./vids ./counts_history ./tracking_history ./benchmarks


COPY entrypoint /entrypoint
RUN chmod +x /entrypoint

#USER iot-container-user

COPY ./restart_server /restart_server
RUN sed -i 's/\r$//g' /restart_server
RUN chmod +x /restart_server


EXPOSE ${APP_PORT}

#ENV PATH="/venv/bin:$PATH"

ENTRYPOINT ["/entrypoint"]

CMD ["python3", "app.py"]