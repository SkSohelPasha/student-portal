# Installation & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Testing the Application](#testing-the-application)
3. [Production Deployment](#production-deployment)
4. [Database Migration](#database-migration)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git (optional, for version control)

### Step-by-Step Installation

#### 1. Navigate to Project Directory
```bash
cd student_portal
```

#### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

Expected packages:
- Flask==3.0.0
- Flask-SQLAlchemy==3.1.1
- Flask-JWT-Extended==4.6.0
- Flask-CORS==4.0.0
- Flask-Bcrypt==1.0.1
- Werkzeug==3.0.1
- python-dotenv==1.0.0
- PyJWT==2.8.0

#### 4. Configure Environment Variables
The `.env` file is already created with default values. For production, update:

```env
SECRET_KEY=your-production-secret-key-here
JWT_SECRET_KEY=your-production-jwt-secret-here
DATABASE_URI=sqlite:///student_portal.db
```

Generate secure keys:
```python
import secrets
print(secrets.token_hex(32))  # Run this twice for two different keys
```

#### 5. Initialize Database
```bash
python init_db.py
```

This creates:
- Database tables
- 1 Admin account
- 3 Faculty accounts
- 20 Student accounts
- Sample data (courses, assignments, attendance)

#### 6. Run the Application
```bash
python app.py
```

The server will start on http://localhost:5000

#### 7. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

---

## Testing the Application

### Manual Testing via Browser
1. Open http://localhost:5000
2. Login with demo credentials:
   - Admin: `admin` / `admin123`
   - Faculty: `faculty1` / `faculty123`
   - Student: `student1` / `student123`

### Automated API Testing
```bash
# Install requests library if not already installed
pip install requests

# Run test script
python test_api.py
```

This will test:
- ✓ Authentication (login, registration)
- ✓ Student endpoints (courses, assignments, grades)
- ✓ Faculty endpoints (course management)
- ✓ Admin endpoints (analytics, user management)

### Manual API Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Get Student Courses:**
```bash
curl -X GET http://localhost:5000/api/student/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Production Deployment

### Option 1: Deploy with Gunicorn (Linux/macOS)

#### 1. Install Gunicorn
```bash
pip install gunicorn
```

#### 2. Run with Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

Options explained:
- `-w 4`: 4 worker processes
- `-b 0.0.0.0:8000`: Bind to all interfaces on port 8000
- `app:app`: Module name and Flask app instance

#### 3. Use Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/student-portal`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static {
        alias /path/to/student_portal/static;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/student-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Create Systemd Service

Create `/etc/systemd/system/student-portal.service`:
```ini
[Unit]
Description=Student Portal Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/student_portal
Environment="PATH=/path/to/student_portal/venv/bin"
ExecStart=/path/to/student_portal/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start student-portal
sudo systemctl enable student-portal
sudo systemctl status student-portal
```

---

### Option 2: Deploy with Waitress (Windows)

#### 1. Install Waitress
```bash
pip install waitress
```

#### 2. Create Production Server Script

Create `production_server.py`:
```python
from waitress import serve
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting production server on http://0.0.0.0:8000")
    serve(app, host='0.0.0.0', port=8000, threads=4)
```

#### 3. Run Production Server
```bash
python production_server.py
```

---

### Option 3: Deploy to Heroku

#### 1. Create Procfile
```
web: gunicorn app:app
```

#### 2. Create runtime.txt
```
python-3.11.0
```

#### 3. Update requirements.txt
```bash
pip freeze > requirements.txt
```

#### 4. Deploy
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku run python init_db.py
heroku open
```

---

### Option 4: Deploy with Docker

#### 1. Create Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URI=sqlite:///student_portal.db
      - SECRET_KEY=your-secret-key
      - JWT_SECRET_KEY=your-jwt-key
    volumes:
      - ./data:/app/data
```

#### 3. Build and Run
```bash
docker-compose up -d
```

---

## Database Migration

### From SQLite to PostgreSQL

#### 1. Install PostgreSQL Adapter
```bash
pip install psycopg2-binary
```

#### 2. Update .env
```env
DATABASE_URI=postgresql://username:password@localhost:5432/student_portal
```

#### 3. Create PostgreSQL Database
```bash
createdb student_portal
```

#### 4. Initialize
```bash
python init_db.py
```

---

### From SQLite to MySQL

#### 1. Install MySQL Adapter
```bash
pip install pymysql
```

#### 2. Update .env
```env
DATABASE_URI=mysql+pymysql://username:password@localhost:3306/student_portal
```

#### 3. Create MySQL Database
```sql
CREATE DATABASE student_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 4. Initialize
```bash
python init_db.py
```

---

## Security Hardening

### 1. Change Default Credentials
After deployment, immediately:
```python
# Login as admin and change password via UI
# Or run this script:
from app import create_app
from backend.models import db, User

app = create_app()
with app.app_context():
    admin = User.query.filter_by(username='admin').first()
    admin.set_password('new-secure-password')
    db.session.commit()
```

### 2. Update Secret Keys
Generate new keys for production:
```python
import secrets
print(secrets.token_hex(32))
```

Update `.env`:
```env
SECRET_KEY=<generated-key-1>
JWT_SECRET_KEY=<generated-key-2>
```

### 3. Enable HTTPS
Use Let's Encrypt with Certbot:
```bash
sudo certbot --nginx -d your-domain.com
```

### 4. Configure CORS Properly
In production, update `app.py`:
```python
CORS(app, origins=['https://your-domain.com'])
```

### 5. Set Debug to False
In production, ensure `app.py` has:
```python
app.run(debug=False)
```

---

## Performance Optimization

### 1. Database Indexing
Already implemented in models, but monitor slow queries.

### 2. Caching
Install Flask-Caching:
```bash
pip install Flask-Caching
```

Add to `app.py`:
```python
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
```

### 3. Static File Serving
In production, serve static files through Nginx, not Flask.

### 4. Database Connection Pooling
For PostgreSQL/MySQL, configure in `config.py`:
```python
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 10,
    'pool_recycle': 3600,
}
```

---

## Backup and Restore

### Backup SQLite Database
```bash
# Create backup
cp student_portal.db student_portal_backup_$(date +%Y%m%d).db

# Scheduled backup (Linux cron)
0 2 * * * cp /path/to/student_portal.db /backup/student_portal_$(date +\%Y\%m\%d).db
```

### Backup PostgreSQL
```bash
pg_dump student_portal > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# SQLite
cp student_portal_backup.db student_portal.db

# PostgreSQL
psql student_portal < backup.sql
```

---

## Monitoring

### 1. Application Logs
```python
# Add to app.py
import logging
logging.basicConfig(filename='app.log', level=logging.INFO)
```

### 2. Error Tracking
Consider integrating Sentry:
```bash
pip install sentry-sdk[flask]
```

### 3. Performance Monitoring
Use Flask-MonitoringDashboard:
```bash
pip install flask-monitoringdashboard
```

---

## Troubleshooting

### Common Issues

**Issue: Port 5000 already in use**
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Linux/macOS

# Kill process or use different port in app.py
```

**Issue: Database locked (SQLite)**
```bash
# Close all connections and restart
rm student_portal.db
python init_db.py
```

**Issue: Module not found errors**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Issue: CORS errors in browser**
```python
# Update app.py to allow your frontend domain
CORS(app, origins=['http://localhost:3000'])
```

**Issue: JWT token expired**
```python
# Default is 1 day, adjust in config.py
JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
```

---

## Maintenance

### Regular Tasks
1. **Daily**: Check application logs
2. **Weekly**: Database backup
3. **Monthly**: Update dependencies
4. **Quarterly**: Security audit

### Update Dependencies
```bash
pip list --outdated
pip install --upgrade package-name
pip freeze > requirements.txt
```

### Health Check Endpoint
Add to `app.py`:
```python
@app.route('/health')
def health():
    return jsonify({'status': 'healthy'}), 200
```

---

## Support

For issues:
1. Check [README.md](README.md)
2. Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Check application logs
4. Run test suite: `python test_api.py`

---

**Deployment Checklist:**
- [ ] Update SECRET_KEY and JWT_SECRET_KEY
- [ ] Change default admin password
- [ ] Configure database (PostgreSQL/MySQL for production)
- [ ] Set DEBUG=False
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up automated backups
- [ ] Configure logging
- [ ] Test all endpoints
- [ ] Set up monitoring

---

**Version: 1.0**  
**Last Updated: March 9, 2026**
