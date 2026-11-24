<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = request()->user();
        $scope = fn ($query) => $user->isAdmin() ? $query : $query->where('user_id', $user->id);

        $totals = [
            'total' => $scope(Appointment::query())->count(),
            'pending' => $scope(Appointment::query()->where('status', 'pending'))->count(),
            'approved' => $scope(Appointment::query()->where('status', 'approved'))->count(),
            'completed' => $scope(Appointment::query()->where('status', 'completed'))->count(),
        ];

        $recent = $scope(
            Appointment::query()
                ->with('user:id,name,email,phone', 'service:id,name,duration,price')
                ->latest()
        )->limit(5)->get();

        $upcoming = $scope(
            Appointment::query()
                ->with('user:id,name,email,phone', 'service:id,name,duration,price')
                ->whereDate('appointment_date', '>=', Carbon::today())
                ->whereIn('status', ['pending', 'approved'])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
        )->limit(5)->get();

        $calendar = $scope(
            Appointment::query()
                ->selectRaw('DATE(appointment_date) as day')
                ->distinct()
                ->orderBy('day')
        )->pluck('day')
            ->map(fn ($day) => Carbon::parse($day)->toDateString())
            ->values();

        $calendarCounts = $scope(
            Appointment::query()
                ->selectRaw('DATE(appointment_date) as day, COUNT(*) as total')
                ->groupBy('day')
        )->pluck('total', 'day')->mapWithKeys(
            fn ($total, $day) => [Carbon::parse($day)->toDateString() => (int) $total]
        );

        $counts = $scope(
            Appointment::query()
                ->whereDate('appointment_date', '>=', Carbon::today()->subDays(6))
                ->whereDate('appointment_date', '<=', Carbon::today())
                ->selectRaw('DATE(appointment_date) as day, COUNT(*) as total')
                ->groupBy('day')
        )->pluck('total', 'day');

        $chart = collect(range(6, 0))->map(function (int $daysAgo) use ($counts) {
            $day = Carbon::today()->subDays($daysAgo);

            return [
                'label' => $day->format('M j'),
                'total' => (int) ($counts[$day->toDateString()] ?? 0),
            ];
        })->values();

        return response()->json([
            'totals' => $totals,
            'recent' => $recent,
            'upcoming' => $upcoming,
            'calendar' => $calendar,
            'calendar_counts' => $calendarCounts,
            'chart' => $chart,
        ]);
    }
}
