<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request, AvailabilityService $availability)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $service = Service::findOrFail($data['service_id']);

        if ($service->status !== 'active') {
            return response()->json(['message' => 'This service is not available for booking.'], 422);
        }

        return response()->json(['slots' => $availability->slots($data['date'], (int) $service->duration)]);
    }
}
