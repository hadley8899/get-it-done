FROM ubuntu:22.04

WORKDIR ./

RUN apt-get update && \
    apt-get install -y php php-cli php-mbstring php-xml php-mysql php-curl php-zip php-gd php-intl php-imagick php-redis php-ldap php-pear php-fpm \
    composer nginx

RUN useradd --create-home --shell /bin/bash --user-group appuser
USER appuser

EXPOSE 8000

LABEL maintainer="Ryan"
LABEL version="1.0"
LABEL description="This is the base image for the backend service"
