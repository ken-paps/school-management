<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            // Identity
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'         => ['required', 'string', Password::min(8)],

            // Enrollment
            'admission_number' => ['required', 'string', 'max:50', 'unique:students,admission_number'],
            'class_id'         => ['nullable', 'integer', 'exists:classes,id'],
            'enrollment_date'  => ['nullable', 'date'],

            // Personal
            'date_of_birth'    => ['nullable', 'date', 'before:today'],
            'gender'           => ['nullable', Rule::in(['male', 'female', 'other'])],

            // Guardian
            'guardian_name'    => ['nullable', 'string', 'max:255'],
            'guardian_phone'   => ['nullable', 'string', 'max:30'],
            'guardian_email'   => ['nullable', 'email', 'max:255'],

            // Other
            'address'          => ['nullable', 'string', 'max:1000'],
            'notes'            => ['nullable', 'string', 'max:2000'],
        ];
    }
}
