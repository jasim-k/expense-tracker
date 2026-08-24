<?php

namespace App\Enums;

enum TransactionType: string
{
    case Income = 'income';
    case Expense = 'expense';
    case AssetLog = 'asset_log';

    public static function fromCategoryType(CategoryType $type): self
    {
        return match ($type) {
            CategoryType::Income => self::Income,
            CategoryType::Expense => self::Expense,
            CategoryType::AssetMaintenance => self::AssetLog,
        };
    }
}
