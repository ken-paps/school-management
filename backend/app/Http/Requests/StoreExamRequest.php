<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'term'         => ['required', Rule::in(['term1', 'term2', 'term3'])],
            'year'         => ['required', 'integer', 'min:2020', 'max:2100'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_published' => ['boolean'],
        ];
    }
}