# DOCKER README

## Instructions

- Makesure you have docker installed on your desktop
- Run your docker application
- Then follow this steps
```sh
# from root of this project
cd todo/todo_fw/database

# once you are inside
docker compose up -d

# incase updating schema
# delete docker
docker compose down

# delete database-data
rm -rf ../database-data

# repeat docker compose

# check your database
psql -h localhost -p 5433 -U postgres -d todo.db
```