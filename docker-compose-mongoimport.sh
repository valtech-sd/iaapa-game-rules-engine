#!/bin/bash

# This is a SHELL SCRIPT that imports a file into the mongodb container.

# The file name comes from the command line argument.
FILE="$1"
# Map this file both in the host and the container, for verification and the command line
FILE_HOST="./mongodb/mongoimport/$FILE"
FILE_CONTAINER="/tmp/mongoimport/$FILE"
# read the password from the file in secrets
MONGO_PASSWORD=$(cat ./mongodb/secrets/iaapa-password)
# This is the command that runs inside the container
COMMAND="/usr/bin/mongoimport --db=\"iaapa\" --collection=\"Players\" --username=\"iaapa\" --password=\"$MONGO_PASSWORD\" --type=csv --headerline --mode=upsert --upsertFields=\"rfid\" --file=\"$FILE_CONTAINER\""

function help() {
  echo "This command is used to import data into the mongodb container."
  echo "Command should be used as follows"
  echo " ./docker-compose-mongoimport.sh [FILE TO IMPORT]"
  echo "   [FILE TO IMPORT]              - File to import into the mongodb container,"
  echo "                                   must be in the ./mongodb/mongoimport directory."
  echo ""
}

# if we're not passed a command, exit
if [ -z "$COMMAND" ]; then
  help
  echo "No command specified"
  exit 1
fi

# if we're not passed a file, exit
if [ -z "$FILE" ]; then
  help
  echo "No file specified"
  exit 1
fi

# check that the file exists
if [ ! -f "$FILE_HOST" ]; then
  help
  echo "File does not exist: $FILE_HOST"
  exit 1
fi

echo "db container running:"
echo "$COMMAND"
docker compose exec db /bin/sh -c "$COMMAND"
