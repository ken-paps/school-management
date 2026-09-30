<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkStoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin', 'teacher']) ?? false;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'date'     => ['required', 'date', 'before_or_equal:today'],

            'records'                 => ['required', 'array', 'min:1'],
            'records.*.student_id'    => [
                'required',
                'integer',
                Rule::exists('students', 'id')->where('class_id', $this->input('class_id')),
            ],
            'records.*.status'        => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'records.*.notes'         => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'records.*.student_id.exists' => 'One or more students do not belong to the selected class.',
            'date.before_or_equal'        => 'You cannot mark attendance for a future date.',
        ];
    }
}