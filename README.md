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


Create a .env file inside the client/ directory and add this line.

VITE_API_BASE_URL=http://localhost:8088
Remember that the port set in both the client and server must match, for example if you change the PORT in server/.env to 3000 then the client should be http://localhost:3000

//need to have a key from https://www.geoapify.com/(you can use mine)
VITE_GEOAPIFY_KEY=0961ffde35ea4983ace9f087df1df71b


.gitignore
server/.env


