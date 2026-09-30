<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        $subjectId = $this->route('subject')?->id;

        return [
            'name'             => ['required', 'string', 'max:255'],
            'code'             => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subjectId)],
            'description'      => ['nullable', 'string', 'max:2000'],
            'periods_per_week' => ['nullable', 'integer', 'min:1', 'max:20'],
            'is_active'        => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'A subject with this code already exists.',
        ];
    }
}
