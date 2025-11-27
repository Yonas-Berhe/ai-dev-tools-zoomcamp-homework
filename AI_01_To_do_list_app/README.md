# Django TODO Application

A simple and elegant TODO application built with Django that allows users to create, edit, delete, and manage their tasks efficiently.

## Features

- ✅ **Create TODOs** - Add new tasks with title, description, and due date
- ✏️ **Edit TODOs** - Update existing tasks
- 🗑️ **Delete TODOs** - Remove completed or unnecessary tasks
- 📅 **Assign Due Dates** - Set deadlines for your tasks
- ✔️ **Mark as Resolved** - Toggle tasks between complete and incomplete status
- 🎨 **Clean UI** - Simple and intuitive user interface
- 🔐 **Admin Panel** - Manage tasks through Django's admin interface

## Screenshots

The app includes:
- Task list view with visual indicators for completed tasks
- Task creation and editing forms
- Due date tracking with calendar input
- Delete confirmation to prevent accidental removals

## Tech Stack

- **Framework**: Django 4.2.26
- **Language**: Python 3.9+
- **Database**: SQLite (default, can be configured for PostgreSQL, MySQL, etc.)
- **Frontend**: HTML, CSS (inline styling)

## Project Structure

```
AI_01/
├── manage.py
├── db.sqlite3
├── todoproject/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── tasks/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── views.py
    ├── urls.py
    ├── tests.py
    ├── migrations/
    └── templates/
        └── tasks/
            ├── base.html
            ├── task_list.html
            ├── task_form.html
            └── task_confirm_delete.html
```

## Installation & Setup

### Prerequisites

- Python 3.9 or higher
- pip (Python package installer)
- Virtual environment (recommended)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd AI_01
```

### Step 2: Create a Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install Django
```

Or if you have a `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### Step 4: Apply Database Migrations

```bash
python manage.py migrate
```

### Step 5: Create a Superuser (Optional)

To access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to set:
- Username
- Email address (optional)
- Password

### Step 6: Run the Development Server

```bash
python manage.py runserver
```

The application will be available at: **http://127.0.0.1:8000/**

## Usage

### Main Application

1. **View Tasks**: Navigate to `http://127.0.0.1:8000/` to see all your tasks
2. **Create Task**: Click "Add New Task" button
3. **Edit Task**: Click "Edit" button on any task
4. **Delete Task**: Click "Delete" button and confirm
5. **Toggle Status**: Click "Mark Complete" or "Mark Incomplete" to change task status

### Admin Panel

1. Navigate to `http://127.0.0.1:8000/admin/`
2. Login with your superuser credentials
3. Manage tasks with advanced filtering and search capabilities

## Running Tests

The project includes comprehensive tests covering models, views, URLs, and complete workflows.

Run all tests:
```bash
python manage.py test tasks
```

Run specific test class:
```bash
python manage.py test tasks.tests.TaskModelTest
```

Run with verbose output:
```bash
python manage.py test tasks --verbosity=2
```

### Test Coverage

- ✅ Model creation and validation
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Task completion toggle
- ✅ URL routing
- ✅ 404 error handling
- ✅ Complete user workflows

## API Endpoints

| URL | Method | Description |
|-----|--------|-------------|
| `/` | GET | List all tasks |
| `/create/` | GET/POST | Create new task |
| `/update/<id>/` | GET/POST | Update existing task |
| `/delete/<id>/` | GET/POST | Delete task |
| `/toggle/<id>/` | POST | Toggle task completion |
| `/admin/` | GET | Admin panel |

## Database Schema

### Task Model

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| title | CharField(200) | Task title (required) |
| description | TextField | Task description (optional) |
| completed | BooleanField | Completion status (default: False) |
| due_date | DateField | Due date (optional) |
| created_at | DateTimeField | Auto-set on creation |
| updated_at | DateTimeField | Auto-updated on save |

## Configuration

### Settings

Key settings can be modified in `todoproject/settings.py`:

- `DEBUG`: Set to `False` in production
- `ALLOWED_HOSTS`: Add your domain for production
- `DATABASES`: Configure different database backends
- `TIME_ZONE`: Adjust to your local timezone

## Deployment

For production deployment:

1. Set `DEBUG = False` in settings.py
2. Configure `ALLOWED_HOSTS`
3. Use a production database (PostgreSQL recommended)
4. Collect static files: `python manage.py collectstatic`
5. Use a production server (Gunicorn, uWSGI)
6. Set up a reverse proxy (Nginx, Apache)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

Your Name - yonasm.berhe@gmail.com

Project Link: [https://github.com/Yonas-Berhe/ai-dev-tools-zoomcamp-homework]

## Acknowledgments

- Django documentation
- Python community
- All contributors

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'django'`
- **Solution**: Make sure you've activated your virtual environment and installed Django

**Issue**: Database errors on first run
- **Solution**: Run `python manage.py migrate` to create database tables

**Issue**: Static files not loading
- **Solution**: Make sure `DEBUG = True` for development, or run `collectstatic` for production

**Issue**: Port 8000 already in use
- **Solution**: Run on a different port: `python manage.py runserver 8080`

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Task categories/tags
- [ ] Priority levels
- [ ] Search and filter functionality
- [ ] Export tasks to CSV/PDF
- [ ] Email notifications for due dates
- [ ] Mobile responsive design improvements
- [ ] REST API for mobile app integration

---

**Enjoy managing your tasks! 📝✨**
