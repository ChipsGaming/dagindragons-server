#!/bin/bash
. ./vars.sh

curl -v \
  --header "X-Auth-Token: $token" \
  localhost:8000/view/player/$1
