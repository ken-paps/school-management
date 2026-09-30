<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        $teacher = $this->route('teacher');
        $userId = $teacher?->user_id;
        $teacherId = $teacher?->id;

        return [
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password'        => ['nullable', 'string', Password::min(8)],

            'employee_number' => ['required', 'string', 'max:50', Rule::unique('teachers', 'employee_number')->ignore($teacherId)],
            'hire_date'       => ['nullable', 'date'],

            'phone'           => ['nullable', 'string', 'max:30'],
            'address'         => ['nullable', 'string', 'max:1000'],

            'qualification'   => ['nullable', 'string', 'max:255'],
            'specialization'  => ['nullable', 'string', 'max:255'],
            'bio'             => ['nullable', 'string', 'max:2000'],

            'subject_ids'     => ['nullable', 'array'],
            'subject_ids.*'   => ['integer', 'exists:subjects,id'],
        ];
    }
}
