<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        $student = $this->route('student');
        $userId = $student?->user_id;
        $studentId = $student?->id;

        return [
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password'         => ['nullable', 'string', Password::min(8)],

            'admission_number' => ['required', 'string', 'max:50', Rule::unique('students', 'admission_number')->ignore($studentId)],
            'class_id'         => ['nullable', 'integer', 'exists:classes,id'],
            'enrollment_date'  => ['nullable', 'date'],

            'date_of_birth'    => ['nullable', 'date', 'before:today'],
            'gender'           => ['nullable', Rule::in(['male', 'female', 'other'])],

            'guardian_name'    => ['nullable', 'string', 'max:255'],
            'guardian_phone'   => ['nullable', 'string', 'max:30'],
            'guardian_email'   => ['nullable', 'email', 'max:255'],

            'address'          => ['nullable', 'string', 'max:1000'],
            'notes'            => ['nullable', 'string', 'max:2000'],
        ];
    }
}
