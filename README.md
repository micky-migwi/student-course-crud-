📚 CRUD API — Students & Courses

A simple and modern CRUD application built with FastAPI (or Node.js if you choose), implementing two related entities: Students and Courses. This project fulfills the PLP Academy Week 5 assignment requirements for building a database-connected CRUD system.

🚀 Project Overview

This API allows users to:

➕ Create new students and courses

📄 Read (list or fetch) students and courses

✏️ Update existing records

❌ Delete records

🔗 Manage relationships between Students and Courses

It is connected to a relational database and follows clean architecture and best practices for readability and scalability.

🛠️ Tech Stack
Layer	Technology
Backend	FastAPI (or Express.js if chosen)
Database	MySQL / PostgreSQL / SQLite
ORM	SQLAlchemy (FastAPI) OR Prisma/Sequelize (Node.js)
Tools	Uvicorn, Git, VS Code
📂 Project Structure
project-folder/
│── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routes/
│   │   ├── students.py
│   │   ├── courses.py
│── requirements.txt
│── README.md

🗄️ Database Schema
Students Table
Field	Type
id	INT (PK)
name	VARCHAR
email	VARCHAR
course_id	INT (FK)
Courses Table
Field	Type
id	INT (PK)
title	VARCHAR
description	TEXT
▶️ Running the Project
1. Clone the Repository
git clone https://github.com/yourusername/students-courses-crud.git
cd students-courses-crud

2. Create a Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

3. Install Dependencies
pip install -r requirements.txt

4. Run the API
uvicorn app.main:app --reload

5. Open the API Docs

FastAPI auto-generates documentation:

👉 http://127.0.0.1:8000/docs

🔥 API Endpoints
Students
Method	Endpoint	Action
POST	/students/	Create student
GET	/students/	Get all students
GET	/students/{id}	Get single student
PUT	/students/{id}	Update student
DELETE	/students/{id}	Delete student
Courses
Method	Endpoint	Action
POST	/courses/	Create course
GET	/courses/	Get all courses
GET	/courses/{id}	Get course
PUT	/courses/{id}	Update course
DELETE	/courses/{id}	Delete course
📝 Features

Clean, organized folder structure

Error handling (404, 400, validation)

Relationship mapping between Students and Courses

Fully tested CRUD endpoints

Auto-generated documentation

Lightweight and beginner-friendly

👨🏽‍🎓 Assignment Compliance Checklist

✔️ Two CRUD entities
✔️ Database connection
✔️ Clean README instructions
✔️ API endpoints documented
✔️ Suitable for GitHub submission
✔️ PLP Academy Week 5 standard

🙌 Acknowledgments

Special thanks to PLP Academy for providing free, accessible, high-quality software engineering training to learners across Africa. Your mission is impacting lives and shaping careers.
