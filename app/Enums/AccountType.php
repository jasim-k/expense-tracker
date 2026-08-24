<?php

namespace App\Enums;

enum AccountType: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case Credit = 'credit';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Physical Cash',
            self::Bank => 'Bank / Digital',
            self::Credit => 'Credit',
        };
    }
}
