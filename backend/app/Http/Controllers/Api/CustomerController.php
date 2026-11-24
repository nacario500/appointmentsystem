<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->withCount('appointments')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $customers]);
    }

    public function show(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->load([
            'appointments' => fn ($query) => $query
                ->with('service')
                ->orderByDesc('appointment_date')
                ->orderByDesc('appointment_time'),
        ]);

        return response()->json(['customer' => $customer]);
    }
}
