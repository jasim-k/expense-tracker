<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionStoreRequest extends FormRequest
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
            'account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('user_id', $userId)],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('user_id', $userId)],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
            'dynamic_metadata' => ['nullable', 'array'],
            'reminders' => ['nullable', 'array'],
            'reminders.*.enabled' => ['required', 'boolean'],
            'reminders.*.offset_days' => ['required', 'integer', 'min:0', 'max:3650'],
        ];
    }
}
