# PostgreSQL Integration for SPP System

## Quick Start

### 1. Run the automated setup

```bash
npm run setup-postgres
```

This will:

- Install all required PostgreSQL dependencies
- Create `.env` file with default configuration
- Show you the next steps

### 2. Configure your database

Edit the `.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spp_system
DB_USER=your_username
DB_PASSWORD=your_password

# Set to true to use PostgreSQL (default is mock data)
USE_POSTGRES=true
```

### 3. Run the migration

```bash
npm run migrate
```

This will create all necessary tables and seed initial data.

### 4. Test the connection

```bash
npm run db:test
```

### 5. Start the application

```bash
npm run dev
```

The application will now use PostgreSQL instead of mock data!

## Manual Setup (Alternative)

### 1. Install Dependencies

```bash
npm install pg @types/pg bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken dotenv @types/node tsx
```

### 2. Database Schema

```sql
-- Create database
CREATE DATABASE spp_system;

-- Use the database
\c spp_system;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'siswa', 'orangtua')),
    full_name VARCHAR(100) NOT NULL,
    student_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    spp_amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Lunas', 'Tunggakan', 'Belum Bayar')),
    last_payment DATE,
    total_debt INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('Transfer', 'Cash', 'E-Wallet')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Confirmed', 'Pending', 'Failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_notifications_student_id ON notifications(student_id);
```

### 3. Environment Variables

Create `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spp_system
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Mode
USE_POSTGRES=true
```

### 4. Sample Data

The migration script will automatically insert sample data:

- **Users**: admin, staff, students, and parents with proper role-based access
- **Students**: 5 sample students with different payment statuses
- **Payments**: Sample payment records
- **Proper password hashing** using bcrypt

## Architecture Overview

### Unified API Service

The system uses a unified API service (`src/services/apiService.ts`) that can seamlessly switch between:

- **Mock Data Mode**: For development and testing (default)
- **PostgreSQL Mode**: For production use

### Key Components

1. **Database Connection** (`src/services/database.ts`)

   - Connection pooling
   - Transaction support
   - Error handling
   - Connection testing

2. **PostgreSQL API** (`src/services/postgresAPI.ts`)

   - User authentication with JWT
   - Password hashing with bcrypt
   - CRUD operations for all entities
   - Input validation and sanitization

3. **Migration System** (`src/utils/migration.ts`)

   - Automatic table creation
   - Data seeding
   - Version control for database changes

4. **Unified API Service** (`src/services/apiService.ts`)
   - Mode switching (Mock ↔ PostgreSQL)
   - Consistent interface
   - Environment-based configuration

## Usage in Components

### Authentication

```typescript
import { apiService } from "../services/apiService";

// Login
const handleLogin = async (credentials) => {
  try {
    const result = await apiService.login(credentials);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Data Operations

```typescript
// Get students
const students = await apiService.getStudents();

// Get payments
const payments = await apiService.getPayments();

// Create payment
const newPayment = await apiService.createPayment(paymentData);
```

### Database Status Component

Use the `DatabaseStatus` component to show connection status:

```typescript
import DatabaseStatus from "../components/database/DatabaseStatus";

// In your component
<DatabaseStatus className="mb-4" />;
```

## Security Features

### Password Security

- **bcrypt hashing**: All passwords are hashed with salt rounds
- **No plain text storage**: Passwords are never stored in plain text
- **Secure comparison**: Uses timing-safe comparison

### JWT Authentication

- **Stateless authentication**: No server-side session storage
- **Configurable expiration**: Tokens expire after set time
- **Role-based access**: Tokens include user role information

### Database Security

- **Parameterized queries**: Prevents SQL injection
- **Input validation**: All inputs are validated before database operations
- **Transaction safety**: Database operations use transactions when needed

## Environment Switching

### Development Mode (Mock Data)

```env
USE_POSTGRES=false
# OR simply don't set USE_POSTGRES
```

### Production Mode (PostgreSQL)

```env
USE_POSTGRES=true
# OR
NODE_ENV=production
```

## Available Scripts

```bash
# Install PostgreSQL dependencies and setup
npm run setup-postgres

# Run database migration
npm run migrate

# Test database connection
npm run db:test

# Start development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Common Issues

1. **Connection refused**

   - Check if PostgreSQL is running
   - Verify host and port in .env file
   - Check firewall settings

2. **Authentication failed**

   - Verify username and password in .env
   - Check PostgreSQL user permissions
   - Ensure database exists

3. **Permission denied**

   - User needs CREATE privileges for migration
   - Check database user permissions
   - Verify database ownership

4. **TypeScript errors**
   - Run `npm install` to ensure all types are installed
   - Check that @types/node is installed for process.env

### Migration Issues

```bash
# If migration fails, you can run it manually:
npx tsx src/utils/migration.ts

# Or drop and recreate the database:
# In PostgreSQL:
DROP DATABASE IF EXISTS spp_system;
CREATE DATABASE spp_system;
# Then run migration again
```

### Development Tips

1. **Use mock data for fast development**

   - Keep `USE_POSTGRES=false` during development
   - Switch to PostgreSQL for testing integrations

2. **Database connection pooling**

   - The pool handles connections automatically
   - No need to manually open/close connections

3. **Error handling**
   - All database operations return structured error responses
   - Use try-catch blocks in your components

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
NODE_ENV=production
USE_POSTGRES=true
DB_HOST=your-prod-db-host
DB_PORT=5432
DB_NAME=spp_system_prod
DB_USER=spp_user
DB_PASSWORD=secure-random-password
JWT_SECRET=very-long-secure-random-string-minimum-32-characters
```

### Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Use environment variables for all sensitive data
- [ ] Set up SSL/TLS for database connections
- [ ] Configure proper database user with minimal privileges
- [ ] Enable database connection limits
- [ ] Set up monitoring and logging
- [ ] Use HTTPS for the application
- [ ] Configure CORS properly
- [ ] Enable rate limiting for API endpoints

### Database Backup

```bash
# Backup
pg_dump -h localhost -U username spp_system > backup.sql

# Restore
psql -h localhost -U username spp_system < backup.sql
```

## Integration with Existing Features

### Notifications (WhatsApp Integration)

- Parent phone numbers are stored in PostgreSQL
- Notification history is tracked in the database
- All existing notification features work seamlessly

### PDF Generation

- Reports pull data from PostgreSQL
- All existing PDF generation features remain functional
- Performance improved with proper database indexing

### Role-Based Access Control

- User roles are stored in PostgreSQL
- JWT tokens include role information
- All existing access control logic works unchanged

This integration maintains backward compatibility while providing a robust database foundation for production use.
