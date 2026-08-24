<?php

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'parent_id' => null,
            'name' => fake()->unique()->word(),
            'type' => fake()->randomElement(CategoryType::cases())->value,
            'icon_emoji' => '📁',
            'custom_field_definitions' => null,
        ];
    }

    public function parent(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
        ]);
    }

    public function child(Category $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent->id,
            'type' => $parent->type->value,
        ]);
    }

    /**
     * @param  array<int, array{name: string, key?: string, type: string, reminder?: bool, reminder_offset?: int}>  $fields
     */
    public function withCustomFields(array $fields): static
    {
        return $this->state(fn (array $attributes) => [
            'custom_field_definitions' => $fields,
        ]);
    }
}
