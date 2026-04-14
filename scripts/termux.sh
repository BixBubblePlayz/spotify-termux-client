#!/data/data/com.termux/files/usr/bin/sh
set -e

npm run serve &
SERVER_PID=$!
trap 'kill $SERVER_PID' INT TERM EXIT
HOST=0.0.0.0 npm start
