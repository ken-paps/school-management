<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSchoolClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'grade_level' => ['nullable', 'integer', 'min:1', 'max:12'],
            'section'     => ['nullable', 'string', 'max:20'],
            'capacity'    => ['required', 'integer', 'min:1', 'max:200'],
            'teacher_id'  => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'teacher'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'teacher_id.exists' => 'The selected teacher does not exist or is not a teacher.',
        ];
    }
}
