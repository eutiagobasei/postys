#!/bin/bash

set -o xtrace

docker rmi localhost/postys || true
docker build --target dist -t localhost/postys -f Dockerfile.dev .
docker build --target devcontainer -t localhost/postys-devcontainer -f Dockerfile.dev .
