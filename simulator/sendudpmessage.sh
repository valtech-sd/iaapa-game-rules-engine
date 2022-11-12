#!/bin/sh -e

MESSAGE_FILE_PATH=$1

if ! command -v nc &> /dev/null
then
    echo "nc could not be found: Install "nc" before proceeding"
    exit
fi

if [ ! -f "$MESSAGE_FILE_PATH" ]
then
	echo "File does not exist"
	echo "./sendmessage.sh [filename]"
	exit;
fi

cat $MESSAGE_FILE_PATH | nc -u -w1 localhost 3333
