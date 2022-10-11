# Declare arguments we're expecting passed into Dockerfile
# via Context from docker-compose.yml or docker build.
ARG RMQ_VERSION_TAG=3.9-management

# Start with RabbitMQ image and desired version...
FROM rabbitmq:${RMQ_VERSION_TAG}

# Add Ansible so we can do further provisioning easily
# (Do this FIRST so that it is a cached step in build!)
RUN apt -y update && \
    apt -y install software-properties-common && \
    apt-add-repository ppa:ansible/ansible && \
    apt -y install ansible

# Define environment variables
# The path that holds the RMQ Pid so we can check for RMQ "ready"
ENV RABBITMQ_PID_FILE /var/lib/rabbitmq/rabbitmq.pid
# The path of the provisioning setup
ENV PROVISIONING_CONTAINER_PATH /tmp/provisioning

# Copy config files
COPY --chown=rabbitmq:rabbitmq ./config/enabled_plugins.erl /etc/rabbitmq/enabled_plugins
COPY --chown=rabbitmq:rabbitmq ./config/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

COPY ./provisioning ${PROVISIONING_CONTAINER_PATH}
COPY ./secrets /tmp/secrets

# Add a custom init script to serve as entry point for our custom image
COPY init.sh /init.sh
RUN chmod +x /init.sh

# Expose ports
EXPOSE \
    # 4369 = RMQ EMPD Peer Discovery
    4369 \
    # 5672 = AMQP
    5672 \
    # 1883 = MQTT
    1883 \
    # 15675 = Web MQTT (MQTT over WebSockets)
    15675 \
    # 25672 = Used for inter-node and CLI tools communication
    25672 \
    # 15672 = Management
    15672 \
    # 15674 = Web Stomp
    15674

# Define default command for Docker Up
CMD ["/init.sh"]
