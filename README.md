<h1 align="center">
  Samehadakuu
</h1>

<p align="center">
  <b>Platform Streaming Anime Online dengan Sistem Earning & Referral</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-NextAuth.js-purple?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

## Tentang Proyek

Samehadakuu adalah platform streaming anime berbasis web yang dibangun menggunakan **Next.js App Router**. Selain menyediakan konten anime secara gratis, platform ini dilengkapi dengan **sistem earning** — pengguna dapat menghasilkan saldo dengan cara menonton episode, mengajak teman (referral), dan mengklaim bonus harian.

---

## Fitur Utama

### Untuk Pengguna
| Fitur | Deskripsi |
|---|---|
| Streaming Anime | Tonton anime dengan kualitas HD secara gratis |
| Pencarian Anime | Cari anime berdasarkan judul atau genre |
| Watchlist | Simpan daftar anime yang ingin ditonton |
| Riwayat Tonton | Lacak episode yang sudah ditonton |
| Sistem Earning | Dapatkan saldo dari aktivitas menonton |
| Program Referral | Ajak teman dan dapatkan komisi referral |
| Klaim Bonus | Klaim bonus harian dan reward khusus |
| Withdraw | Tarik saldo ke rekening/e-wallet |
| Komentar | Diskusi di setiap episode anime |
| Chat | Fitur chat komunitas |

### Untuk Admin
| Fitur | Deskripsi |
|---|---|
| Dashboard Admin | Kelola seluruh konten dan pengguna |
| Manajemen User | Suspend, flag, atau verifikasi akun |
| Anti-Bot & Fraud Detection | Deteksi multi-akun via IP & device fingerprint |
| Kelola Earning | Atur aturan earning dan payout |
| Sistem Iklan | Manajemen unit iklan (leaderboard, native, mobile) |
| Pengaturan Sistem | Konfigurasi link Telegram, aturan platform |

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Animasi | Framer Motion |
| ORM | Prisma |
| Database | SQLite (dev) |
| Autentikasi | NextAuth.js + Prisma Adapter |
| HTTP Client | Axios |
| Scraping | Cheerio |
| Keamanan | bcryptjs (hashing password) |
| Utilities | clsx, date-fns |

---

## Struktur Proyek

```
app/
├── page.tsx              # Halaman utama (featured, latest, ongoing anime)
├── layout.tsx            # Root layout
├── loading.tsx           # Loading screen global
├── anime/                # Halaman detail anime
├── watch/                # Halaman streaming episode
├── search/               # Halaman pencarian
├── watchlist/            # Watchlist pengguna
├── dashboard/            # Dashboard pengguna (saldo, earning, referral)
├── auth/                 # Login & Register
├── admin/                # Panel admin
├── go/                   # Redirect link tracker
├── blocked/              # Halaman akun tersuspend
├── privacy/              # Kebijakan privasi
├── terms/                # Syarat & ketentuan
└── api/                  # API Routes (Next.js)

components/               # Komponen reusable (Hero, AnimeSection, Ads, dll)
lib/                      # Utility functions (anime fetcher, prisma client, dll)
prisma/
├── schema.prisma         # Skema database
├── migrations/           # Riwayat migrasi
└── seed.js               # Data awal (seed)
```

---

## Skema Database (Prisma)

Model utama yang digunakan:

- **User** — Data pengguna, saldo (watch/referral/bonus), status (flagged, suspended, bot)
- **CollectedLink** — Link video yang sudah dikumpulkan/ditonton user
- **WatchHistory** — Riwayat tonton per user
- **ReferralView** — Tracking view dari referral
- **PayoutRequest / WithdrawRequest** — Permintaan penarikan saldo
- **EarningLog** — Log semua aktivitas earning
- **UserClaim** — Klaim bonus harian
- **ChatMessage** — Pesan chat komunitas
- **Comment** — Komentar per episode

---

## Cara Menjalankan

### Prasyarat
- Node.js `>=18`
- npm atau yarn

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/ivankafi03/web-samehadakuu.git
cd web-samehadakuu

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Isi DATABASE_URL dan NEXTAUTH_SECRET di file .env

# 4. Generate Prisma client & jalankan migrasi
npx prisma migrate dev

# 5. (Opsional) Seed data awal
node prisma/seed.js

# 6. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Role Pengguna

| Role | Akses |
|---|---|
| MEMBER | Streaming, watchlist, earning, referral, withdraw, komentar |
| ADMIN | Semua akses MEMBER + manajemen konten, user, iklan, sistem |

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">
  Dibuat menggunakan Next.js & Prisma
</p>
