#!/bin/bash

while true; do
 nohup sudo service mongod  >/dev/null
  nohup nodemon bin/app.js >/dev/null #>> nohup.out 
  nohup service apache2 start >/dev/null #2>&1   # doesn't create nohup.out
 nohup service mysql start >/dev/null #2>&1 
done &

