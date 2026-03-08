#!/usr/bin/env bash

docker kill postys || true 
docker rm postys || true 
docker create --name postys -p 3000:3000 -p 4200:4200 localhost/postys
