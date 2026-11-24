<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\ScheduleSetting;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Bookly Admin',
            'email' => 'admin@bookly.test',
            'phone' => '09170000000',
            'password' => 'Admin@12345',
            'role' => 'admin',
        ]);

        $customers = collect([
            ['name' => 'Maria Santos', 'email' => 'maria@example.com', 'phone' => '09171111111'],
            ['name' => 'Juan Dela Cruz', 'email' => 'juan@example.com', 'phone' => '09172222222'],
            ['name' => 'Ana Reyes', 'email' => 'ana@example.com', 'phone' => '09173333333'],
        ])->map(fn (array $data) => User::create([
            ...$data,
            'password' => 'Customer@123',
            'role' => 'customer',
        ]));

        $services = collect([
            ['name' => 'General Consultation', 'description' => 'Talk to a doctor about any health concern.', 'duration' => 30, 'price' => 500, 'status' => 'active'],
            ['name' => 'Dental Checkup', 'description' => 'Routine oral exam and cleaning.', 'duration' => 45, 'price' => 800, 'status' => 'active'],
            ['name' => 'Eye Examination', 'description' => 'Vision screening and eye health check.', 'duration' => 30, 'price' => 650, 'status' => 'active'],
            ['name' => 'Laboratory Test', 'description' => 'Blood and urine tests with results released the same day.', 'duration' => 20, 'price' => 400, 'status' => 'active'],
            ['name' => 'Vaccination', 'description' => 'Flu, tetanus, and other routine vaccines.', 'duration' => 15, 'price' => 350, 'status' => 'active'],
            ['name' => 'Physical Therapy', 'description' => 'Guided session for pain relief and mobility.', 'duration' => 60, 'price' => 900, 'status' => 'inactive'],
        ])->map(fn (array $data) => Service::create($data));

        ScheduleSetting::current();

        $today = Carbon::today();

        $appointments = [
            [0, 0, $today->copy(), '09:00', 'pending'],
            [1, 1, $today->copy(), '10:00', 'approved'],
            [2, 2, $today->copy()->addDay(), '09:30', 'pending'],
            [0, 3, $today->copy()->addDay(), '13:00', 'approved'],
            [1, 4, $today->copy()->subDay(), '09:00', 'completed'],
            [2, 0, $today->copy()->subDays(2), '10:00', 'completed'],
            [0, 1, $today->copy()->subDays(3), '11:00', 'rejected'],
            [1, 2, $today->copy()->subDays(4), '14:00', 'cancelled'],
            [2, 0, $today->copy()->addDays(2), '10:30', 'pending'],
            [0, 4, $today->copy()->addDays(3), '11:00', 'approved'],
        ];

        foreach ($appointments as $index => [$customerIndex, $serviceIndex, $date, $time, $status]) {
            Appointment::create([
                'reference' => 'BK-DEMO'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                'user_id' => $customers[$customerIndex]->id,
                'service_id' => $services[$serviceIndex]->id,
                'appointment_date' => $date->toDateString(),
                'appointment_time' => $time.':00',
                'phone' => $customers[$customerIndex]->phone,
                'notes' => $index === 0 ? 'First visit, please call before the schedule.' : null,
                'status' => $status,
            ]);
        }
    }
}
