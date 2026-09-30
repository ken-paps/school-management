<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Admin + teacher can post notices (per §5 matrix)
        return $this->user()?->hasRole(['admin', 'teacher']) ?? false;
    }

    public function rules(): array
    {
        return [
            'title'      => ['required', 'string', 'max:255'],
            'body'       => ['required', 'string', 'max:10000'],
            'audience'   => ['required', Rule::in(['all', 'admins', 'teachers', 'students'])],
            'is_pinned'  => ['boolean'],
            'publish'    => ['boolean'], // controls whether published_at gets set
        ];
    }
}