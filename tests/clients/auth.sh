#!/bin/bash

curl -v \
  -X POST \
  --header "Content-Type: application/json" \
  --data "{\"name\": \"$1\", \"password\": \"$2\"}" \
  localhost:8000/auth
