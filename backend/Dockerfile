# Utilisation d'une image Ubuntu comme base au lieu de NVIDIA CUDA
FROM ubuntu:22.04

# Définition des variables d'environnement
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Paris

# Installation des dépendances de base
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    yasm \
    cmake \
    libtool \
    libc6 \
    libc6-dev \
    unzip \
    wget \
    libnuma1 \
    libnuma-dev \
    git \
    gnupg2 \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    sudo \
    libass-dev \
    python3 \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Vérification que pkg-config est correctement installé
RUN which pkg-config && pkg-config --version

# Installation de CUDA Toolkit optimisé pour WSL
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-wsl-ubuntu.pin && \
    mv cuda-wsl-ubuntu.pin /etc/apt/preferences.d/cuda-repository-pin-600 && \
    wget https://developer.download.nvidia.com/compute/cuda/12.8.1/local_installers/cuda-repo-wsl-ubuntu-12-8-local_12.8.1-1_amd64.deb && \
    dpkg -i cuda-repo-wsl-ubuntu-12-8-local_12.8.1-1_amd64.deb && \
    cp /var/cuda-repo-wsl-ubuntu-12-8-local/cuda-*-keyring.gpg /usr/share/keyrings/ && \
    apt-get update && \
    apt-get install -y cuda-toolkit-12-8 && \
    rm cuda-repo-wsl-ubuntu-12-8-local_12.8.1-1_amd64.deb && \
    rm -rf /var/lib/apt/lists/*

# Installation des headers NVIDIA requis pour FFmpeg
WORKDIR /opt
RUN git clone https://git.videolan.org/git/ffmpeg/nv-codec-headers.git && \
    cd nv-codec-headers && \
    make && \
    make install

# Configuration des variables d'environnement pour CUDA
ENV PATH="/usr/local/cuda-12.8/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/local/cuda-12.8/lib64:${LD_LIBRARY_PATH}"

# Vérification de l'installation de CUDA
RUN nvcc --version

# Téléchargement et compilation de FFmpeg avec support CUDA
WORKDIR /opt
RUN git clone https://git.ffmpeg.org/ffmpeg.git && \
    cd ffmpeg && \
    # Vérification du fonctionnement de pkg-config pour ffnvcodec
    PKG_CONFIG_PATH="/usr/local/lib/pkgconfig" pkg-config --list-all | grep ffnvcodec && \
    # Configuration avec les drapeaux spécifiés
    PKG_CONFIG_PATH="/usr/local/lib/pkgconfig" ./configure \
      --enable-libass \
      --enable-gpl \
      --enable-nonfree \
      --enable-cuda-nvcc \
      --enable-libnpp \
      --enable-cuvid \
      --enable-nvenc \
      --enable-ffnvcodec \
      --extra-cflags="-I/usr/local/include -I/usr/local/cuda-12.8/include" \
      --extra-ldflags="-L/usr/local/lib -L/usr/local/cuda-12.8/lib64" \
      --disable-static \
      --enable-shared && \
    make -j$(nproc) && \
    make install && \
    ldconfig

# Vérification de l'installation de FFmpeg et des filtres CUDA
RUN ffmpeg -version && ffmpeg -filters | grep cuda

# Création des dossiers de travail
WORKDIR /app
RUN mkdir -p /app/assets /app/subtitles

# Copie des fichiers de l'application Python
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copie du reste des fichiers de l'application
COPY . .

# Exposition du port pour l'application web
EXPOSE 8000

# Commande par défaut pour lancer l'application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]