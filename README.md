# Dashboard Laporan Survei Lapangan — MAPID Assessment

Dashboard internal untuk survei pemetaan lapangan. Pelapor membuat laporan (koordinat tertulis di deskripsi), Approver menyetujui/menolak, Admin mengatur pengguna & hak akses.

## Tech Stack

- **Frontend:** React + Vite + Tailwind + TanStack Query
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL
- **Infra:** Docker & Docker Compose

## Struktur Folder

```
.
├── docker-compose.yml
├── schema.sql
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       ├── types.ts
│       ├── middleware/auth.ts
│       ├── utils/response.ts
│       └── modules/
│           ├── auth/
│           │   ├── routes.ts
│           │   ├── controller.ts
│           │   ├── service.ts
│           │   └── permissions.ts
│           ├── reports/
│           │   ├── routes.ts
│           │   ├── controller.ts
│           │   └── service.ts
│           └── history/
│               ├── routes.ts
│               ├── controller.ts
│               └── service.ts
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       ├── lib/
│       │   ├── api.ts
│       │   └── navigation.ts
│       ├── services/
│       │   ├── auth.ts
│       │   └── reports.ts
│       ├── hooks/
│       │   ├── useAuth.tsx
│       │   ├── usePermissions.ts
│       │   ├── useReports.ts
│       │   ├── useUsers.ts
│       │   ├── useHistory.ts
│       │   └── useRights.ts
│       ├── components/
│       │   ├── ReportForm.tsx
│       │   ├── ReportTable.tsx
│       │   ├── UserForm.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── layout/Sidebar.tsx
│       │   └── ui/
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── field.tsx
│       │       ├── table.tsx
│       │       ├── modal.tsx
│       │       ├── state.tsx
│       │       └── pagination.tsx
│       └── pages/
│           ├── LoginPage.tsx
│           ├── DashboardPage.tsx
│           ├── UsersPage.tsx
│           ├── RightsPage.tsx
│           └── HistoryPage.tsx
└── README.md
```

## Cara Penggunaan

### Prasyarat

- Docker + Docker Compose (Docker Desktop atau WSL Ubuntu)
- Git

### 1. Clone

```bash
git clone <repo-url>
cd <nama-folder>
```

### 2. Jalankan (Docker)

```bash
docker compose up --build
```

Tunggu sampai `mapid-postgres healthy` → `mapid-api api http://localhost:3000` → `mapid-web` started.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health → `{ ok: true }`
- DB seed otomatis dari `schema.sql` (3 user + 4 laporan + permissions)

Stop: `docker compose down` — reset data: `docker compose down -v`

Buka `http://localhost:5173`, login dengan akun demo di bawah.

### 4. Akun Demo

| Role     | Username | Password   | Hak                               |
| -------- | -------- | ---------- | --------------------------------- |
| Admin    | `admin`  | `admin123` | semua + atur pengguna & hak akses |
| Pelapor  | `budi`   | `budi123`  | buat & edit laporan own pending   |
| Approver | `siti`   | `siti123`  | approve/reject                    |

### 5. API

- `GET /health` - health check
- `POST /auth/login` - login
- `GET /auth/users` - list pengguna
- `POST /auth/users` - tambah pengguna
- `PATCH /auth/users/:id` - edit pengguna
- `DELETE /auth/users/:id` - hapus pengguna
- `GET /auth/permissions` - list hak akses
- `PATCH /auth/permissions` - ubah hak akses
- `GET /reports` - list laporan
- `GET /reports/stats` - statistik laporan
- `POST /reports` - buat laporan
- `PATCH /reports/:id` - edit laporan
- `PATCH /reports/:id/status` - approve/reject laporan
- `GET /history` - riwayat persetujuan
