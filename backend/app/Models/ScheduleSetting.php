<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'operating_days',
        'opening_time',
        'closing_time',
        'slot_duration',
        'max_per_slot',
    ];

    protected function casts(): array
    {
        return [
            'operating_days' => 'array',
            'slot_duration' => 'integer',
            'max_per_slot' => 'integer',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'operating_days' => [1, 2, 3, 4, 5, 6],
            'opening_time' => '09:00:00',
            'closing_time' => '17:00:00',
            'slot_duration' => 30,
            'max_per_slot' => 1,
        ]);
    }
}
