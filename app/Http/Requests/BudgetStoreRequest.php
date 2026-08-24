<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetStoreRequest extends FormRequest
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
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('user_id', $userId)],
            'period_month' => ['required', 'date'],
            'limit_amount' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
