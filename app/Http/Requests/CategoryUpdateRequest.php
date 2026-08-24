<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $userId)],
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('categories', 'name')
                    ->where(fn ($query) => $query->where('user_id', $userId)->where('parent_id', $this->input('parent_id')))
                    ->ignore($this->route('category')),
            ],
            'type' => ['required', Rule::in(['income', 'expense', 'asset_maintenance'])],
            'icon_emoji' => ['nullable', 'string', 'max:16'],
            'custom_field_definitions' => ['nullable', 'array'],
            'custom_field_definitions.*.name' => ['required_with:custom_field_definitions', 'string', 'max:255'],
            'custom_field_definitions.*.key' => ['nullable', 'string', 'max:255'],
            'custom_field_definitions.*.type' => ['required_with:custom_field_definitions', Rule::in(['date', 'number', 'text', 'checkbox'])],
            'custom_field_definitions.*.reminder' => ['nullable', 'boolean'],
            'custom_field_definitions.*.reminder_offset' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
