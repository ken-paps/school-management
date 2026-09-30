<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkStoreGradesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin', 'teacher']) ?? false;
    }

    public function rules(): array
    {
        return [
            'exam_id'    => ['required', 'integer', 'exists:exams,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'records'                    => ['required', 'array'],
            'records.*.student_id'       => ['required', 'integer', 'exists:students,id'],
            'records.*.score'            => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'records.*.max_score'        => ['nullable', 'numeric', 'min:1', 'max:1000'],
            'records.*.remarks'          => ['nullable', 'string', 'max:500'],
        ];
    }
}