<?php

namespace App\Enums;

enum CategoryType: string
{
    case Income = 'income';
    case Expense = 'expense';
    case AssetMaintenance = 'asset_maintenance';

    public function label(): string
    {
        return match ($this) {
            self::Income => 'Income',
            self::Expense => 'Expense',
            self::AssetMaintenance => 'Asset / Document',
        };
    }

    /**
     * Whether logging against this category reduces the account balance.
     */
    public function isDebit(): bool
    {
        return $this !== self::Income;
    }
}
