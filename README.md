- install and start postgress

- create .env file inside server folder:
# Server port
PORT=8088

# PostgreSQL connection string
# Replace username, password, dbname with your own
DATABASE_URL=postgres://username:password@localhost:5432/dbname?sslmode=disable

# Secret for signing JWT tokens (choose something random & long)
JWT_SECRET=supersecretkey123

# Allowed CORS origin (your React app)
CORS_ORIGIN=http://localhost:3033





.gitignore
server/.env


