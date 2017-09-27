#!/bin/bash

main()
{
	echo "Welcome to the CSYMA installation script"
	echo "We will install the rest of the files for you and set up an admin user for you."
	echo "Please be sure to run this script as root"


	echo -n "Changing file permissions"
	chmod -R 777  ../
	echo "..........done"

	echo "Setting up directories"
		echo -n "config"
			mkdir -p ../config
		echo "...done"
		echo -n "views"
			mkdir -p ../views
		echo "..done"
		echo -n "public"
			mkdir -p ../public/apps
		echo "..done"
		echo -n "routes"
			mkdir -p ../routes
		echo "..done"
	echo "copying system files"
		echo -n "config"
			cp config/config.example.js ../config/config.example.js
		echo "..done"
		echo -n "passport config"
			cp config/passport.example.js ../config/passport.example.js
		echo "..done"
	echo -n "Setting up fake enviroment variables"
	if [ ! -f ../.env ]; then
		cp .env_sample ../.env
		echo "..........done. Please to to csyma/.env to edit them."
	else
		echo " "
		echo ".env file found. Overwrite it?(Y/n)"
		read ans
		case "$ans" in
		[yY] | [yY][Ee][Ss] )
			echo -n "Setting up fake environment variables"
			cp .env_sample ../.env
			echo "..........done. Please to to csyma/.env to edit them."
			;;
		*)
			echo "Using existing fake environment variables"
		esac
	fi
	

	

	echo -n "Setting up config files."
	if [ ! -f ../config/config.js ]; then
		cp ../config/config.example.js ../config/config.js
		echo "..........done. Please to to csyma/config to edit them."
	else
		echo " "
		echo "System configuration file found. Overwrite it?(Y/n)"
		read ans
		case "$ans" in
		[yY] | [yY][Ee][Ss] )
			echo -n "Setting up config files"
			cp ../config/config.example.js ../config/config.js
			echo "..........done. Please to to csyma/config to edit them."
			;;
		*)
			echo "Using existing system configuration files"
		esac
	fi
	
	echo -n "Setting up passport config files."
	if [ ! -f ../config/passport.js ]; then
		cp ../config/passport.example.js ../config/passport.js
		echo "..........done. Please to to csyma/config to edit them."
	else
		echo " "
		echo "Passport configuration file found. Overwrite it?(Y/n)"
		read ans
		case "$ans" in
		[yY] | [yY][Ee][Ss] )
			echo -n "Setting up config files"
			cp ../config/passport.example.js ../config/passport.js
			echo "..........done. Please to to csyma/config to edit them."
			;;
		*)
			echo "Using existing passport configuration files"
		esac
	fi
	
	
	echo "Please now go to the configuration and .env files and change the default values then run first-time-setup.js."
	echo "Or do you just want to continue with the default values (fatal errors may occur)?(Y/n)"
	read ans
	case "$ans" in
	[yY] | [yY][Ee][Ss] )
		echo "Installing apps and Setting up user"
		nodejs first-time-setup.js
		;;
	*)
		echo "Set up will confinue with first-time-setup.js"
	esac
	
}

main

