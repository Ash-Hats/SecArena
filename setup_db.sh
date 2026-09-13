#!/bin/bash

# Exit on error
set -e

echo "Setting up PostgreSQL database and user for SecArena..."
echo "You may be prompted for your sudo password."

# Run psql commands as the postgres user
sudo -u postgres psql <<EOF
-- Create the user if it doesn't exist
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'secarena_user') THEN
    CREATE USER secarena_user WITH PASSWORD 'secarena_password';
  END IF;
END
\$\$;

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE secarena_db' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'secarena_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE secarena_db TO secarena_user;
ALTER DATABASE secarena_db OWNER TO secarena_user;
EOF

echo ""
echo "Database setup successfully completed!"
