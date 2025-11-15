.PHONY: info build

SHELL := /bin/bash
ROOT_DIR := ${CURDIR}

info: 
	@echo "Makefile for frontend-framework"
	@echo "Available commands"
	@echo "make build 				- Biuld the frontend-framework package"



# Build frontend-framework package and install dependencies
build:
	@echo "Install Dependencies"
	@SKIP_FRONTEND_FRAMEWORK_POSTINSTALL=1 npm install
	@cd framework/runtime && SKIP_FRONTEND_FRAMEWORK_POSTINSTALL=1 npm install
	@echo "Build the frontend-framework"
	@cd framework/runtime && SKIP_FRONTEND_FRAMEWORK_POSTINSTALL=1 npm run build
	@echo 'Remove unwanted files on root'
	@rm -rf ./dist
	@rm -rf ./index.html
	@rm -rf ./index.css
	@rm -rf ./index.js