# VPS Database Setup Guide

## 1. Connect to Your VPS
```bash
ssh root@38.54.122.192
```

## 2. Install MySQL (if not already installed)
```bash
# Update system
apt update && apt upgrade -y

# Install MySQL
apt install mysql-server -y

# Secure MySQL installation
mysql_secure_installation
```

## 3. Configure MySQL for Remote Access
```bash
# Edit MySQL configuration
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find and change bind-address to:
bind-address = 0.0.0.0

# Restart MySQL
systemctl restart mysql
```

## 4. Create Database and User
```bash
# Login to MySQL
mysql -u root -p

# Run these SQL commands:
```

```sql
-- Create database
CREATE DATABASE retail_accounting;

-- Create user for remote access (optional, or use root)
CREATE USER 'retail_user'@'%' IDENTIFIED BY 'MNXfamilyTeam#123';
GRANT ALL PRIVILEGES ON retail_accounting.* TO 'retail_user'@'%';

-- Grant privileges to root for remote access
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'MNXfamilyTeam#123';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

## 5. Configure Firewall
```bash
# Allow MySQL port
ufw allow 3306

# Check firewall status
ufw status
```

## 6. Test Connection from Local
```bash
# Test from your local machine
mysql -h 38.54.122.192 -u root -p retail_accounting
```

## 7. Import Database Schema
The application will automatically create tables when it starts, or you can manually run:

```bash
# On your VPS, save the init.sql file and run:
mysql -u root -p retail_accounting < init.sql
```

## Current Configuration
- **Host**: 38.54.122.192
- **User**: root
- **Password**: MNXfamilyTeam#123
- **Database**: retail_accounting
- **Port**: 3306

## Security Notes
- Consider creating a dedicated MySQL user instead of using root
- Use strong passwords
- Configure SSL if handling sensitive data
- Regularly backup your database
- Monitor access logs