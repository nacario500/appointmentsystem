<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::query()
            ->when($request->boolean('active'), fn ($q) => $q->where('status', 'active'))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $services]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $service = Service::create($data);

        return response()->json(['data' => $service], 201);
    }

    public function update(Request $request, Service $service)
    {
        $service->update($this->validated($request));

        return response()->json(['data' => $service->fresh()]);
    }

    public function destroy(Service $service)
    {
        if ($service->appointments()->exists()) {
            return response()->json([
                'message' => 'This service has existing bookings and cannot be deleted. Set it to inactive instead.',
            ], 422);
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'duration' => ['required', 'integer', 'min:5', 'max:600'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', 'in:active,inactive'],
        ]);
    }
}
