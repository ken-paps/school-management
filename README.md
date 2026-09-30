# School Management System

A full-stack school management system built with Laravel 12 and React 18, supporting role-based access for administrators, teachers, and students.

## Features

- **Authentication** — Laravel Sanctum cookie-based SPA auth
- **Roles** — Admin, Teacher, Student (admin-created accounts only)
- **Users** — full CRUD, password generator, soft deletes
- **Students** — enrollment, guardians, class assignment
- **Teachers** — employment records, subject assignments
- **Classes** — grade levels, sections, capacity
- **Subjects** — catalog with codes
- **Attendance** — daily per-class marking
- **Exams & Grades** — bulk entry, auto letter grades, publish workflow
- **Notices** — audience-targeted announcements
- **Dashboards** — role-aware stats and activity

## Tech Stack

**Backend:** Laravel 12, Breeze API, Sanctum, MySQL 8, PHP 8.4
**Frontend:** React 18, Vite, Tailwind CSS v4, React Router v8, Axios, Lucide
**Auth:** Cookie-based Sanctum SPA flow

## Setup

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=localhost --port=8000
