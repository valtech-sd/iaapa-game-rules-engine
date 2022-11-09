#!/bin/bash

# This is a SHELL SCRIPT can run YARN commands inside the rules-engine container.

CONTAINER_WORKING_DIR="$1"
COMMAND="$2"

function help() {
  echo "This command is used to run yarn (npm) scripts your package.json file"
  echo "Command should be used as follows"
  echo " ./docker-compose-run.sh [CONTAINER_WORKING_DIR_OF_NODE_PACKAGE] [YARN_SCRIPT]"
  echo "   [CONTAINER_WORKING_DIR_OF_NODE_PACKAGE] - Dircty in container where the package.json is located."
  echo "                                           - Alternativly you can use the shortcut 'simulator' or 'rules-engine' for those respective directories"
  echo "   [YARN_SCRIPT]                           - Script within the package.json file to run"
  echo ""
}

# If we're not passed a working directory, exit
if [ -z "$CONTAINER_WORKING_DIR" ]; then
  help
  echo "No working directory specified"
  echo "Syntax: docker-compose-run.sh <container working directory> <command>"
  exit 1
fi

#if we're not passed a command, exit
if [ -z "$COMMAND" ]; then
  help
  echo "No command specified"
  echo "Syntax: docker-compose-run.sh <container working directory> <command>"
  exit 1
fi

if [ "$CONTAINER_WORKING_DIR" == "simulator" ]; then
  CONTAINER_WORKING_DIR="/home/node/simulator"
fi

if [ "$CONTAINER_WORKING_DIR" == "rules-engine" ]; then
  CONTAINER_WORKING_DIR="/home/node/app"
fi

echo "rules-engine running command: \"$COMMAND\" in directory: \"$CONTAINER_WORKING_DIR\""
docker compose exec rules-engine /scripts/shell-yarn.sh "$CONTAINER_WORKING_DIR" "$COMMAND"

