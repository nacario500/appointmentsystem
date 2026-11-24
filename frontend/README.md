# Bookly – Appointment Booking Frontend (React + Vite + Tailwind)

## Run
    npm install
    cp .env.example .env     # set VITE_API_URL to your Laravel API
    npm run dev

## API the frontend expects (Laravel + Sanctum, Bearer token)
Auth: POST /register, /login, /logout · GET /me · PUT /profile, /password
Services: GET /services (?active=1&search=) · POST /services · PUT/DELETE /services/{id}
Availability: GET /availability?service_id=&date= -> { slots: [{ time: "09:00", available: true }] }
Appointments: GET /appointments (?search=&status=&date=; admin = all, customer = own)
  POST /appointments {service_id, appointment_date, appointment_time, phone, notes} -> { appointment: {reference,...} }
  PATCH /appointments/{id}/status {status}   (409/422 on slot conflict)
Customers (admin): GET /customers (?search=, with appointments_count) · GET /customers/{id} (with appointments.service)
Schedule (admin): GET/PUT /schedule {operating_days:[0-6], opening_time, closing_time, slot_duration, max_per_slot}
  GET/POST /blocked-dates {date,reason,type} · DELETE /blocked-dates/{id}
Dashboard (admin): GET /dashboard/stats -> { totals:{total,pending,approved,completed}, recent[], upcoming[], calendar:[dates], chart:[{label,total}] }
Reports (admin): GET /reports?period=daily|weekly|monthly&from=&to= -> { rows:[{label,total}], status_summary:[{status,total}], top_services:[{name,total}] }
Roles: user.role is "admin" or "customer".
