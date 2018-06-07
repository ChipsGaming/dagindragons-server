#!/bin/bash
. ./vars.sh

curl -v \
  -X POST \
  --header "X-Auth-Token: $token" \
  localhost:8000/attack/$1
