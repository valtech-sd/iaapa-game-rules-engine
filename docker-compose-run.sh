#!/bin/bash

# This is a SHELL SCRIPT can run YARN commands inside the rules-engine container.

CONTAINER_WORKING_DIR="$1"
COMMAND="$2"

# If we're not passed a working directory, exit
if [ -z "$CONTAINER_WORKING_DIR" ]; then
  echo "No working directory specified"
  echo "Syntax: docker-compose-run.sh <container working directory> <command>"
  exit 1
fi

#if we're not passed a command, exit
if [ -z "$COMMAND" ]; then
  echo "No command specified"
  echo "Syntax: docker-compose-run.sh <container working directory> <command>"
  exit 1
fi

echo "rules-engine running command: \"$COMMAND\" in directory: \"$CONTAINER_WORKING_DIR\""
docker compose exec rules-engine /scripts/shell-yarn.sh "$CONTAINER_WORKING_DIR" "$COMMAND"

