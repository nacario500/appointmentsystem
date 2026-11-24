<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduleSetting;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function show()
    {
        return response()->json(ScheduleSetting::current());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'operating_days' => ['required', 'array', 'min:1'],
            'operating_days.*' => ['integer', 'between:0,6'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'slot_duration' => ['required', 'integer', 'min:5', 'max:240'],
            'max_per_slot' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $schedule = ScheduleSetting::current();

        $schedule->update([
            'operating_days' => array_values(array_unique($data['operating_days'])),
            'opening_time' => $data['opening_time'].':00',
            'closing_time' => $data['closing_time'].':00',
            'slot_duration' => $data['slot_duration'],
            'max_per_slot' => $data['max_per_slot'],
        ]);

        return response()->json($schedule->fresh());
    }
}
