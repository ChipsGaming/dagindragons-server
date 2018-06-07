#!/bin/bash

OPTIND=1
token="e11aba99-387e-4b89-a56a-0b76c2e907d7"
while getopts "t:" opt; do
    case "$opt" in
    t)  token=$OPTARG
        ;;
    esac
done
shift $((OPTIND-1))
[ "${1:-}" = "--" ] && shift
