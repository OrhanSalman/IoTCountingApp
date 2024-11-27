#!/bin/bash

# Funktion zur Erkennung der Architektur
detect_platform() {
  if [[ $(uname -m) == "x86_64" ]]; then
    echo "x86_64"  # 64-bit x86
  elif [[ $(uname -m) == "aarch64" ]]; then
    echo "arm64"   # ARM 64-bit
  elif [[ $(uname -m) == "armv7l" ]]; then
    echo "arm"     # ARM 32-bit
  else
    echo "unknown" # Unbekannte Architektur
  fi
}

# Architektur erkennen
PLATFORM=$(detect_platform)

# Umgebungsvariablen oder spezifische Konfigurationen setzen
case $PLATFORM in
  x86_64)
    echo "Detected platform: x86_64"
    export REDIS_IMAGE="redis:latest"
    export MONGODB_IMAGE="mongo:latest"
    ;;
  arm64)
    echo "Detected platform: arm64"
    # Überprüfen der CPU-Architektur und -Features
    CPU_INFO=$(lscpu | grep "Architecture" | awk '{print $2}')
    echo "Detected CPU architecture: $CPU_INFO"

    # Überprüfung der ARM-Version (mindestens ARMv8.2-A)
    if [[ "$CPU_INFO" == "aarch64" ]]; then
      # Zusätzliche Überprüfung auf ARMv8.2-A-Features
      ARM_FEATURES=$(lscpu | grep -E "Flags|v8")
      if echo "$ARM_FEATURES" | grep -q "v8"; then
        export REDIS_IMAGE="arm64v8/redis:latest"
        export MONGODB_IMAGE="arm64v8/mongo:latest"
      else
        echo "WARNING: Your ARM architecture does not meet the minimum requirements for MongoDB (ARMv8.2-A or higher)."
        echo "Using MongoDB version 4.4.18 instead."
        export REDIS_IMAGE="arm64v8/redis:latest"
        export MONGODB_IMAGE="arm64v8/mongo:4.4.18"
      fi
    else
      echo "WARNING: Your ARM architecture does not meet the minimum requirements for MongoDB (ARMv8.2-A or higher)."
      echo "Using MongoDB version 4.4.18 instead."
      export REDIS_IMAGE="arm64v8/redis:latest"
      export MONGODB_IMAGE="arm64v8/mongo:4.4.18"
    fi
    ;;
  arm)
    echo "Detected platform: arm"
    echo "WARNING: MongoDB is not supported on ARM 32-bit architectures. Using MongoDB version 4.4.19 instead."
    export REDIS_IMAGE="arm32v7/redis:latest"
    export MONGODB_IMAGE="arm32v7/mongo:4.4.18"
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    export REDIS_IMAGE="redis:latest"
    export MONGODB_IMAGE="mongo:latest"
    ;;
esac

# Ausgabe der gesetzten Umgebungsvariablen
echo "Using Redis image: $REDIS_IMAGE"
echo "Using MongoDB image: $MONGODB_IMAGE"