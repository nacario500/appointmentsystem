<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Illuminate\Http\Request;

class BlockedDateController extends Controller
{
    public function index()
    {
        $dates = BlockedDate::query()->orderBy('date')->get();

        return response()->json(['data' => $dates]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'unique:blocked_dates,date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:blocked,holiday'],
        ]);

        $blocked = BlockedDate::create($data);

        return response()->json(['data' => $blocked], 201);
    }

    public function destroy(BlockedDate $blockedDate)
    {
        $blockedDate->delete();

        return response()->json(['message' => 'Date unblocked.']);
    }
}
