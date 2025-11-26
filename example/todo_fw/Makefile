.PHONY: info run start-db reset-db go-run start

SHELL := /bin/bash
ROOT_DIR := ${CURDIR}

info:
	@echo 'Makefile for todo with frontend: frontend-framework javascript and backend: golang api + postgresql + docker'
	@echo 'Available command:'
	@echo '====================================================================='
	@echo 'info 			- This information as currently showed up'
	@echo '====================================================================='
	@echo 'Please start your database first by following the instruction below:'
	@echo 'start-db 		- Starting your database'
	@echo '====================================================================='
	
run:
	@echo 'Starting docker...'
	@cd database && docker compose up -d --no-build --no-recreate
	@echo 'Running backend...'
	@cd backend && go run .
	@echo 'Starting frontend...'
	@npm run todo_fw

start-db:
	@echo 'Starting docker...'
	@cd database && docker compose up -d --no-build --no-recreate

reset-db:
	@echo 'Warning: this will delete your database entirely'
	@cd database && docker compose down
	@rm -rf ./database-data

go-run:
	@echo 'Running backend...'
# 	@cd backend && go run .
	@command -v entr >/dev/null 2>&1 || { echo "Installing entr..."; brew install entr; }
	@find backend -name '*.go' | entr -r sh -c 'cd backend && go run .'

install:
	@echo 'install dependency frontend-framework...'
	@npm install frontend-framework

start:
	@echo 'Starting frontend...'
	@npm run todo_fw