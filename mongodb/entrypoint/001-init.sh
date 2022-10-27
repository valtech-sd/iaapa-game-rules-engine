#!/bin/bash
set -e;

PASSWORD_FILE=/tmp/secrets/$MONGODB_CUSTOM_USERNAME-password

if [ -f "$PASSWORD_FILE" ]; then
	echo "Password already exists"
else
	echo "Setting password"
	PASSWORD=$(tr -dc 'A-Za-z0-9!"#$%&'\''()*+,-./:;<=>?@[\]^_`{|}~' </dev/urandom | head -c 13  ; echo)
	echo $PASSWORD >> /tmp/secrets/$MONGODB_CUSTOM_USERNAME-password
		
	#MONGO_NON_ROOT_ROLE="${MONGO_NON_ROOT_ROLE:-readWrite}"

	#db.createUser({
	#	user: $(_js_escape "$MONGO_NON_ROOT_USERNAME"),
	#	pwd: $(_js_escape "$MONGO_NON_ROOT_PASSWORD"),
	#	roles: [ { role: $(_js_escape "$MONGO_NON_ROOT_ROLE"), db: $(_js_escape "$MONGO_INITDB_DATABASE") } ]
	#	})
fi
