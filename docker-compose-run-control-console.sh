#!/bin/bash

# This is a SHELL SCRIPT can run a control console inside the rules-engine container.

function help() {
  echo "This command is used to run a control console inside the rules-engine container."
  echo "Command should be used as follows"
  echo " ./docker-compose-run-control-console.sh"
  echo ""
}

echo "rules-engine running control console"
docker compose exec rules-engine /home/node/simulator/control-console.sh

