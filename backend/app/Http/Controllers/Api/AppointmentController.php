<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $appointments = Appointment::query()
            ->with([
                'user:id,name,email,phone',
                'service:id,name,description,duration,price,image_url,status',
            ])
            ->when(! $user->isAdmin(), fn ($query) => $query->where('user_id', $user->id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('date'), fn ($query) => $query->whereDate('appointment_date', $request->string('date')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('service', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $appointments]);
    }

    public function store(Request $request, AvailabilityService $availability)
    {
        $data = $request->validate([
            'service_id' => [
                'required',
                'integer',
                Rule::exists('services', 'id')->where('status', 'active'),
            ],
            'appointment_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'phone' => ['required', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $day = Carbon::parse($data['appointment_date'])->startOfDay();
        $time = Carbon::parse($data['appointment_time'])->format('H:i:s');
        $service = Service::findOrFail($data['service_id']);

        if (! $availability->isOpen($day)) {
            return response()->json(['message' => 'The clinic is closed on the selected date.'], 422);
        }

        if (! $availability->isSlot($day, $time, (int) $service->duration)) {
            return response()->json(['message' => 'The selected time is not a valid appointment slot.'], 422);
        }

        if ($availability->slotIsFull($data['appointment_date'], $time, (int) $service->duration)) {
            return response()->json(['message' => 'That time slot is already taken. Please choose another.'], 422);
        }

        $duplicate = Appointment::query()
            ->where('user_id', $request->user()->id)
            ->whereDate('appointment_date', $day)
            ->where('appointment_time', $time)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($duplicate) {
            return response()->json(['message' => 'You already have a booking at this time.'], 409);
        }

        $appointment = Appointment::create([
            'reference' => Appointment::generateReference(),
            'user_id' => $request->user()->id,
            'service_id' => $data['service_id'],
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $time,
            'phone' => $data['phone'],
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'appointment' => $appointment->load('user:id,name,email,phone', 'service'),
        ], 201);
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Appointment::STATUSES)],
        ]);

        $user = $request->user();

        if (! $user->isAdmin()) {
            if ($appointment->user_id !== $user->id) {
                return response()->json(['message' => 'This action is unauthorized.'], 403);
            }

            if ($data['status'] !== 'cancelled') {
                return response()->json(['message' => 'You can only cancel your own bookings.'], 403);
            }

            if (! in_array($appointment->status, ['pending', 'approved'], true)) {
                return response()->json(['message' => 'This booking can no longer be cancelled.'], 422);
            }
        }

        $appointment->update(['status' => $data['status']]);

        return response()->json([
            'appointment' => $appointment->fresh()->load('user:id,name,email,phone', 'service'),
        ]);
    }
}
