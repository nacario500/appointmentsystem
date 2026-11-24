<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

    public const ACTIVE_STATUSES = ['pending', 'approved', 'completed'];

    protected $fillable = [
        'reference',
        'user_id',
        'service_id',
        'appointment_date',
        'appointment_time',
        'phone',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'BK-'.strtoupper(bin2hex(random_bytes(3)));
        } while (self::where('reference', $reference)->exists());

        return $reference;
    }
}
