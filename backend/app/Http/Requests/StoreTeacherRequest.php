<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            // Identity
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'        => ['required', 'string', Password::min(8)],

            // Employment
            'employee_number' => ['required', 'string', 'max:50', 'unique:teachers,employee_number'],
            'hire_date'       => ['nullable', 'date'],

            // Personal
            'phone'           => ['nullable', 'string', 'max:30'],
            'address'         => ['nullable', 'string', 'max:1000'],

            // Professional
            'qualification'   => ['nullable', 'string', 'max:255'],
            'specialization'  => ['nullable', 'string', 'max:255'],
            'bio'             => ['nullable', 'string', 'max:2000'],

            // Many-to-many
            'subject_ids'     => ['nullable', 'array'],
            'subject_ids.*'   => ['integer', 'exists:subjects,id'],
        ];
    }
}
