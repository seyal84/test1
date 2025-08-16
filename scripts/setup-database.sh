#!/bin/bash

# Database Setup Script for HomeFlow
# This script sets up the PostgreSQL database and user

echo "🗄️  Setting up HomeFlow Database..."

# Database configuration
DB_NAME="homeflow"
DB_USER="homeflow"
DB_PASSWORD="homeflow_password"

# Function to run PostgreSQL commands
run_psql() {
    sudo -u postgres psql -c "$1" 2>/dev/null
}

# Check if database exists
if run_psql "\l" | grep -q "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    run_psql "CREATE DATABASE $DB_NAME;"
    echo "✅ Database created successfully"
fi

# Check if user exists
if run_psql "\du" | grep -q "$DB_USER"; then
    echo "✅ User '$DB_USER' already exists"
else
    echo "👤 Creating user '$DB_USER'..."
    run_psql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "✅ User created successfully"
fi

# Grant permissions
echo "🔑 Setting up permissions..."
run_psql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
run_psql "ALTER USER $DB_USER CREATEDB;"

# Connect to the database and grant schema permissions
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" 2>/dev/null

echo "✅ Database setup completed successfully!"
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"