#!/bin/sh
# wait-for-rabbitmq.sh

set -e
  
host="$1"
shift
cmd="$@"

echo "Checking if rabbitMQ port is open"
until nc -zv $host 5672; do
  echo "RabbitMQ is unavailable - sleeping: Port 5672 unavailable"
  sleep 1
done

until nc -zv $host 15672; do
  echo "RabbitMQ is unavailable - sleeping: Port 15672 unavailable"
  sleep 1
done

#echo "Checking if RabbitMQ has generated passwords"
#while [ ! -f /tmp/secrets/rmqadmin-password ]; do
#  echo "RabbitMQ password not yet generated - sleeping"
#  sleep 1;
#done
#
#
#echo "RabbitMQ is up - executing command"
#
echo "Setting up ENV variables"
export AMQP_CONNECTION_STRING=amqp://rmqadmin:$(cat /tmp/secrets/rmqadmin-password)@$host:5672

echo "Starting Application"
exec $cmd
