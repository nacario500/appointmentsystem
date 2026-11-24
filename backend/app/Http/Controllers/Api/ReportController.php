<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'period' => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $period = $data['period'] ?? 'daily';
        $from = Carbon::parse($data['from'] ?? Carbon::today()->subDays(29)->toDateString())->startOfDay();
        $to = Carbon::parse($data['to'] ?? Carbon::today()->toDateString())->startOfDay();

        $appointments = Appointment::query()
            ->whereDate('appointment_date', '>=', $from)
            ->whereDate('appointment_date', '<=', $to)
            ->get(['id', 'appointment_date', 'status', 'service_id']);

        $rows = $this->buildRows($appointments, $period, $from, $to);

        $statusSummary = $appointments
            ->groupBy('status')
            ->map(fn ($group, $status) => ['status' => $status, 'total' => $group->count()])
            ->values();

        $topServices = Appointment::query()
            ->join('services', 'services.id', '=', 'appointments.service_id')
            ->whereDate('appointment_date', '>=', $from)
            ->whereDate('appointment_date', '<=', $to)
            ->selectRaw('services.name as name, COUNT(*) as total')
            ->groupBy('services.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'total' => (int) $row->total])
            ->values();

        return response()->json([
            'rows' => $rows,
            'status_summary' => $statusSummary,
            'top_services' => $topServices,
        ]);
    }

    private function buildRows($appointments, string $period, Carbon $from, Carbon $to)
    {
        if ($appointments->isEmpty()) {
            return [];
        }

        if ($period === 'daily') {
            $grouped = $appointments->groupBy(fn (Appointment $a) => $a->appointment_date->toDateString());

            return collect(CarbonPeriod::create($from, $to))
                ->map(fn (Carbon $day) => [
                    'label' => $day->format('M j'),
                    'total' => $grouped->get($day->toDateString())?->count() ?? 0,
                ])
                ->values();
        }

        if ($period === 'weekly') {
            $grouped = $appointments->groupBy(
                fn (Appointment $a) => $a->appointment_date->copy()->startOfWeek(Carbon::MONDAY)->toDateString()
            );

            $rows = [];
            $cursor = $from->copy()->startOfWeek(Carbon::MONDAY);
            $last = $to->copy()->startOfWeek(Carbon::MONDAY);

            while ($cursor->lte($last)) {
                $key = $cursor->toDateString();
                $rows[] = [
                    'label' => 'Week of '.$cursor->format('M j'),
                    'total' => $grouped->get($key)?->count() ?? 0,
                ];
                $cursor->addWeek();
            }

            return collect($rows)->values();
        }

        $grouped = $appointments->groupBy(fn (Appointment $a) => $a->appointment_date->format('Y-m'));

        $rows = [];
        $cursor = $from->copy()->startOfMonth();
        $last = $to->copy()->startOfMonth();

        while ($cursor->lte($last)) {
            $key = $cursor->format('Y-m');
            $rows[] = [
                'label' => $cursor->format('M Y'),
                'total' => $grouped->get($key)?->count() ?? 0,
            ];
            $cursor->addMonth();
        }

        return collect($rows)->values();
    }
}
