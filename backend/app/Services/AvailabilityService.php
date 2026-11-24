<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BlockedDate;
use App\Models\ScheduleSetting;
use Carbon\Carbon;

class AvailabilityService
{
    /**
     * Build the bookable slots for a given date.
     *
     * When a service duration is provided, each slot is checked against the
     * full appointment interval so two bookings can never overlap.
     *
     * @return array<int, array{time: string, available: bool}>
     */
    public function slots(string $date, ?int $duration = null): array
    {
        $day = Carbon::parse($date)->startOfDay();
        $schedule = ScheduleSetting::current();

        if (! $this->isOpen($day, $schedule)) {
            return [];
        }

        $opening = Carbon::parse($day->toDateString().' '.$schedule->opening_time);
        $closing = Carbon::parse($day->toDateString().' '.$schedule->closing_time);
        $step = max(5, (int) $schedule->slot_duration);
        $max = max(1, (int) $schedule->max_per_slot);
        $duration = max(5, (int) ($duration ?? $step));

        $appointments = Appointment::query()
            ->with('service:id,duration')
            ->whereDate('appointment_date', $day)
            ->whereIn('status', Appointment::ACTIVE_STATUSES)
            ->get();

        $slots = [];

        for ($cursor = $opening->copy(); $cursor->copy()->addMinutes($duration)->lte($closing); $cursor->addMinutes($step)) {
            $time = $cursor->format('H:i');

            $slots[] = [
                'time' => $time,
                'available' => $this->overlapCount($appointments, $day, $cursor, $duration) < $max,
            ];
        }

        return $slots;
    }

    /**
     * Whether the given date is a working day that is not blocked or in the past.
     */
    public function isOpen(Carbon $day, ?ScheduleSetting $schedule = null): bool
    {
        $schedule ??= ScheduleSetting::current();

        if ($day->lt(Carbon::today())) {
            return false;
        }

        $operatingDays = array_map('intval', $schedule->operating_days ?? []);

        if (! in_array($day->dayOfWeek, $operatingDays, true)) {
            return false;
        }

        return ! BlockedDate::query()->whereDate('date', $day)->exists();
    }

    /**
     * Validate that a time is a real slot for the given date and fits before closing.
     */
    public function isSlot(Carbon $day, string $time, ?int $duration = null): bool
    {
        $schedule = ScheduleSetting::current();
        $opening = Carbon::parse($day->toDateString().' '.$schedule->opening_time);
        $closing = Carbon::parse($day->toDateString().' '.$schedule->closing_time);
        $requested = Carbon::parse($day->toDateString().' '.$time);
        $step = max(5, (int) $schedule->slot_duration);
        $duration = max(5, (int) ($duration ?? $step));

        if ($requested->lt($opening) || $requested->copy()->addMinutes($duration)->gt($closing)) {
            return false;
        }

        return $opening->diffInMinutes($requested) % $step === 0;
    }

    /**
     * Whether the requested interval overlaps too many active appointments.
     */
    public function slotIsFull(string $date, string $time, ?int $duration = null): bool
    {
        $schedule = ScheduleSetting::current();
        $day = Carbon::parse($date)->startOfDay();
        $start = Carbon::parse($day->toDateString().' '.$time);
        $duration = max(5, (int) ($duration ?? $schedule->slot_duration));
        $max = max(1, (int) $schedule->max_per_slot);

        $appointments = Appointment::query()
            ->with('service:id,duration')
            ->whereDate('appointment_date', $day)
            ->whereIn('status', Appointment::ACTIVE_STATUSES)
            ->get();

        return $this->overlapCount($appointments, $day, $start, $duration) >= $max;
    }

    /**
     * Count active appointments whose interval overlaps the requested interval.
     */
    private function overlapCount($appointments, Carbon $day, Carbon $start, int $duration): int
    {
        $end = $start->copy()->addMinutes($duration);

        return $appointments->filter(function (Appointment $appointment) use ($day, $start, $end) {
            $otherStart = Carbon::parse($day->toDateString().' '.$appointment->appointment_time);
            $otherDuration = max(5, (int) ($appointment->service?->duration ?? 30));
            $otherEnd = $otherStart->copy()->addMinutes($otherDuration);

            return $otherStart->lt($end) && $otherEnd->gt($start);
        })->count();
    }
}
