FROM jrottenberg/ffmpeg:5.1-alpine
LABEL maintainer="gaia"
WORKDIR /media
COPY . .
# The media service provides an HTTP API (optional) — left as scaffold.
EXPOSE 9000
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["while true; do sleep 3600; done"]
