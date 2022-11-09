#!/bin/sh

# This is a SHELL SCRIPT that can be called from
# Docker Compose Exec to run YARN commands inside the container

CONTAINER_WORKING_DIR="$1"
COMMAND="$2"

# If we're not passed a working directory, exit
if [ -z "$CONTAINER_WORKING_DIR" ]; then
  echo "No working directory specified"
  echo "Syntax: shell-yarn.sh <container working directory> <command>"
  exit 1
fi

#if we're not passed a command, exit
if [ -z "$COMMAND" ]; then
  echo "No command specified"
  echo "Syntax: shell-yarn.sh <container working directory> <command>"
  exit 1
fi

cd "$CONTAINER_WORKING_DIR"|| exit
yarn "$COMMAND"
