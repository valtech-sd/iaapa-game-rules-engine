#!/bin/sh

run_ansible() {
  ansible-playbook ${PROVISIONING_CONTAINER_PATH}/ansible-config-at-up.yml  \
    -i ${PROVISIONING_CONTAINER_PATH}/inventory
  # Get status for the Ansible command
  ansible_result=$?
  # Fail the container if provisioning fails
  if [ $ansible_result -ne 0 ]; then
    echo "Ansible Provisioning Failed!!"
    kill -9 `cat $RABBITMQ_PID_FILE`
  else
    # All done, output a help string.
    echo "*** Log in the Management UI at port 15672 (example: http://localhost:15672) ***"
  fi
}

# Fire off some initial setup in a shell in the bkg so that
# RMQ server continues to start up
( \
  # The work we're doing requires RMQ to be ready, so we wait.
  rabbitmqctl wait --timeout 60 $RABBITMQ_PID_FILE ; \
  # RMQ is up, do our setup using Ansible which is cross-platform
  run_ansible ; \
  # echo "*** Log in the Management UI at port 15672 (example: http://localhost:15672) ***"
) &

# $@ is used to pass arguments to the rabbitmq-server command.
# For example if you use it like this: docker run -d rabbitmq arg1 arg2,
# it will be as you run in the container rabbitmq-server arg1 arg2
rabbitmq-server $@