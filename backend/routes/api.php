<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\API\UserController;

// ─────────────────────────────────────────────────────
//  User Management (admin only)
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Static routes FIRST (before /{user} wildcard)
    Route::get('/users/generate-password', [UserController::class, 'generatePassword']);

    // RESTful resource routes
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Restore
    Route::post('/users/{id}/restore', [UserController::class, 'restore']);
});

use App\Http\Controllers\API\SchoolClassController;

// ─────────────────────────────────────────────────────
//  Classes
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    // Read access: admin + teacher + student
    Route::get('/classes', [SchoolClassController::class, 'index']);
    Route::get('/classes/{class}', [SchoolClassController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Write access: admin only
    Route::post('/classes', [SchoolClassController::class, 'store']);
    Route::put('/classes/{class}', [SchoolClassController::class, 'update']);
    Route::patch('/classes/{class}', [SchoolClassController::class, 'update']);
    Route::delete('/classes/{class}', [SchoolClassController::class, 'destroy']);
});

use App\Http\Controllers\API\SubjectController;

// ─────────────────────────────────────────────────────
//  Subjects
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{subject}', [SubjectController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::put('/subjects/{subject}', [SubjectController::class, 'update']);
    Route::patch('/subjects/{subject}', [SubjectController::class, 'update']);
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

    Route::post('/subjects/{subject}/assign-teacher', [SubjectController::class, 'assignTeacher']);
    Route::delete('/subjects/{subject}/unassign-teacher/{teacher}', [SubjectController::class, 'unassignTeacher']);
});

use App\Http\Controllers\API\StudentController;

// ─────────────────────────────────────────────────────
//  Students
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    // Read: admin + teacher (per permission matrix)
    Route::middleware('role:admin,teacher')->group(function () {
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{student}', [StudentController::class, 'show']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/students', [StudentController::class, 'store']);
    Route::put('/students/{student}', [StudentController::class, 'update']);
    Route::patch('/students/{student}', [StudentController::class, 'update']);
    Route::delete('/students/{student}', [StudentController::class, 'destroy']);
});

use App\Http\Controllers\API\TeacherController;

// ─────────────────────────────────────────────────────
//  Teachers
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/teachers', [TeacherController::class, 'index']);
    Route::get('/teachers/{teacher}', [TeacherController::class, 'show']);
    Route::post('/teachers', [TeacherController::class, 'store']);
    Route::put('/teachers/{teacher}', [TeacherController::class, 'update']);
    Route::patch('/teachers/{teacher}', [TeacherController::class, 'update']);
    Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy']);
});

use App\Http\Controllers\API\NoticeController;

// ─────────────────────────────────────────────────────
//  Notices
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    // All authenticated users see role-filtered notices
    Route::get('/notices', [NoticeController::class, 'index']);
    Route::get('/notices/{notice}', [NoticeController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin,teacher'])->group(function () {
    Route::post('/notices', [NoticeController::class, 'store']);
    Route::put('/notices/{notice}', [NoticeController::class, 'update']);
    Route::patch('/notices/{notice}', [NoticeController::class, 'update']);
    Route::delete('/notices/{notice}', [NoticeController::class, 'destroy']);
});

use App\Http\Controllers\API\AttendanceController;

// ─────────────────────────────────────────────────────
//  Attendance
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin,teacher'])->group(function () {
    Route::get('/attendance/sheet', [AttendanceController::class, 'sheet']);
    Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::get('/attendance/{attendance}', [AttendanceController::class, 'show']);
    Route::delete('/attendance/{attendance}', [AttendanceController::class, 'destroy']);
});
    
use App\Http\Controllers\API\ExamController;

// ─── Exams ───
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/exams', [ExamController::class, 'index']);
    Route::get('/exams/{exam}', [ExamController::class, 'show']);
});
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/exams', [ExamController::class, 'store']);
    Route::put('/exams/{exam}', [ExamController::class, 'update']);
    Route::patch('/exams/{exam}', [ExamController::class, 'update']);
    Route::delete('/exams/{exam}', [ExamController::class, 'destroy']);
});

use App\Http\Controllers\API\GradeController;   

// ─── Grades ───
Route::middleware(['auth:sanctum', 'role:admin,teacher'])->group(function () {
    Route::get('/grades/sheet', [GradeController::class, 'sheet']);
    Route::post('/grades/bulk', [GradeController::class, 'bulkStore']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/grades', [GradeController::class, 'index']);
    Route::get('/grades/{grade}', [GradeController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:admin,teacher'])->group(function () {
    Route::delete('/grades/{grade}', [GradeController::class, 'destroy']);
});

use App\Http\Controllers\API\DashboardController;

// ─────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});