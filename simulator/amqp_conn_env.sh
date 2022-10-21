#!/bin/sh
set -e
  
host="$1"
shift
cmd="$@"

echo "Setting up ENV variables"
export AMQP_CONNECTION_STRING=amqp://rmqadmin:$(cat ../rabbitmq/secrets/rmqadmin-password)@$host:5672

echo "Starting Application"
$cmd
