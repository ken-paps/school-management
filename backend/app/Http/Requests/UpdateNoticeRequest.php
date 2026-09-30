<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNoticeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $notice = $this->route('notice');

        if (! $user || ! $notice) return false;

        // Admins can edit anything
        if ($user->isAdmin()) return true;

        // Teachers can only edit their own notices
        if ($user->isTeacher() && $notice->posted_by === $user->id) return true;

        return false;
    }

    public function rules(): array
    {
        return [
            'title'      => ['required', 'string', 'max:255'],
            'body'       => ['required', 'string', 'max:10000'],
            'audience'   => ['required', Rule::in(['all', 'admins', 'teachers', 'students'])],
            'is_pinned'  => ['boolean'],
            'publish'    => ['boolean'],
            'unpublish'  => ['boolean'],
        ];
    }
}