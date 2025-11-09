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
	@npm install
	@cd framework/runtime && npm install
	@cd framework/runtime && npm run build