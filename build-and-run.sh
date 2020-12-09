#!/bin/bash
docker kill cam-share-01
docker build -t bbb-webcams-stream-to-screenshare .
docker run --name cam-share-01 --rm bbb-webcams-stream-to-screenshare "$1" "$2"
