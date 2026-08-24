<?php

namespace App\Enums;

enum CustomFieldType: string
{
    case Date = 'date';
    case Number = 'number';
    case Text = 'text';
    case Checkbox = 'checkbox';
}
