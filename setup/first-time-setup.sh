#!/bin/bash

main()
{
	if [ ! -f ../.env ]; then
		cp .env_sample ../.env
   		echo "..."
	fi
	oldname="vipimo"
	echo "Todo: still not looking recursively in files..."
	
	echo "Have already configured your system in config/config.js? This setup will break if you have not done so.(Y/N)"
	read ans
	case "$ans" in
	"y");;
	"Y");;
	default)
		echo "Should exit for any other value"
	esac
	
	echo "Please enter the name of your new database that you've set it in the configuration file"
	read ans
	#cmd=$(find ./ -type f -exec sed -i -e "s/27017\/$oldname/27017\/$ans/g" {} \;)
	#goodresult=$(echo $cmd)
	#echo $goodresult
	nodejs first-time-setup.js
}

main

