Отвечай мне всегда на русском языке
# CableCore Project Context & History

> **Читай этот файл первым, в любом клиенте.** Claude Code подхватывает его
> автоматически; в десктопном приложении открой его сам. Сессии Claude друг
> друга не видят — общего у них только этот репозиторий, поэтому всё, что
> должно пережить разговор, пишется в файлы, а не проговаривается в чате.
> Раздел «Pending Actions» внизу — источник правды; обновляй его после
> заметных изменений.

This document serves as the primary source of truth for Claude Code and other AI assistants. It contains the history, architectural decisions, and current state of the CableCore platform.

## 🚀 Project Overview
**CableCore** is a professional fiber optic and network installation service based in Spain. The platform includes a customer-facing website, a complex quote calculator, and a custom CRM/Admin dashboard.

## 🧠 Historical Context (The Journey with Antigravity)
We have worked together to transform a simple landing page into a full-scale business automation platform.
- **Phase 1: Calculator & Leads.** Built a complex React-based calculator that generates real-time quotes and captures leads.
- **Phase 2: CRM & Projects.** Developed an admin panel to manage leads, convert them to projects, and track installation progress.
- **Phase 3: Financials & Invoices.** Implemented automated PDF invoice generation and expense tracking.
- **Phase 4: SEO & Stabilization.** Focused on resolving Google Search Console errors and optimizing for multi-language indexing (ES, EN, RU).

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS (Theme: Premium Dark / Brand Gold)
- **Internationalization:** `next-intl` (Supported: Spanish, English, Russian)
- **Storage:** Supabase Storage (Bucket: `project-photos`)

## 📍 Current State & Recent Critical Fixes

### 1. SEO & Indexing (IN PROGRESS)
- **Problem A:** Google Search Console flagged "Invalid Review Snippet" — ratingCount was 47 but only 5 reviews in array.
- **Fix A:** Updated `src/lib/seo-metadata.ts`: ratingCount/reviewCount `47` → `5`. Deployed 2026-05-10.
- **Status A:** **Pending User Action.** Go to GSC → Coverage → "Invalid Review Snippet" → click **"Validate Fix"**.

- **Problem B:** 21 pages with "Duplicate, Google chose different canonical than user" — x-default pointed to bare `/servicios/slug` (no locale prefix) which redirected to `/es/`, causing Google to consolidate all language versions under ES canonical.
- **Fix B:** Updated x-default in `sitemap.ts`, `servicios/[slug]/page.tsx`, `blog/[slug]/page.tsx`, and `seo-metadata.ts` to point to `/es/` URLs. Deployed 2026-05-10.

- **Problem C:** ~90% identical content across city pages (instalacion-red-barcelona, -hospitalet, -badalona, etc.) — Google treated them as duplicates.
- **Fix C:** Completely rewrote `src/lib/seo-data/es.ts` (2026-05-10) with unique local content per city: specific barrios, industrial zones, local landmarks, city-specific FAQs. Deployed 2026-05-10.
- **Status B+C:** Monitoring. Re-submit sitemap in GSC and wait 2-4 weeks for Google to re-crawl.

### 2. CRM Photo Uploads
- **Problem:** Photos were uploading but not displaying (403/404 errors).
- **Fix:** Made the `project-photos` Supabase bucket **PUBLIC**. Improved error handling in `ProjectDetail.tsx`.
- **Status:** Fixed.

### 3. CRM Expenses (Gastos)
- **Problem:** Expenses were only saved in local state and lost on refresh.
- **Fix:** Implemented `addExpense`, `deleteExpense`, and `getExpenses` server actions in `src/app/actions/crm.ts`.
- **Status:** ✅ **Fully resolved.** Table `expenses` exists in Supabase with correct schema.

### 4. Database Security — RLS (Row Level Security)
- **Problem:** Tables `activities`, `tasks`, `expenses`, `invoices` had RLS disabled — anyone with the anon key could read/modify data.
- **Fix:** Enabled RLS on all 4 tables via Supabase migration (2026-05-10).
- **Status:** ✅ **Fixed.** All 9 tables now have RLS enabled. Admin panel unaffected — it uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS.

## 🏗 Coding Standards & Patterns
- **Server Actions:** All DB mutations should go through `src/app/actions/crm.ts`.
- **UI Components:** Use the established design system in `src/components/admin`.
- **Aesthetics:** Maintain the "Premium Dark" aesthetic (Glassmorphism, subtle gold gradients).

## 📝 Pending Actions

_Последняя проверка: 2026-09-10._

**Закрыто, не искать заново:**
- Invalid Review Snippet — исправлено, в GSC теперь Passed / 0 invalid.
- "Duplicate, Google chose different canonical" — 0 страниц, Passed.
- Sitemap — 216 URL, Google перечитал 2026-09-09 (Discovered 216).
- Страницы услуг — все 28 слагов × 3 локали имеют richSections, тонких нет.
- `www.cablecore.es` — добавлен в Vercel с 308 на apex, сертификат покрывает.

**Ждём Google (проверить ~2026-09-16):**
- 53 "Crawled - currently not indexed" (32 услуги + 17 блога + 4 разобранных) и
  7 "Redirect error" — по ним запрошена переиндексация.
- ВАЖНО: 21 "Page with redirect" и 2 "Excluded by noindex" **нулём не станут и
  не должны**. Первое — переименованные слаги, которых нет в sitemap; второе —
  `/en/aviso-legal` и `/ru/aviso-legal`, закрытые намеренно (текст по LSSICE
  только на испанском).

**Открыто:**
- Внешних ссылок 0. Кодом не решается — нужен Google Business Profile,
  отраслевые каталоги, локальные ссылки.
- ~94 тонких статьи блога. Крон `gsc-autofix` расширяет ~3 за прогон
  (ежедневно), очередь двигается сама, чинить не нужно.
- `cablecore.es` отдаёт "Proxy Detected" в Vercel — apex идёт через Cloudflare.
  На индексацию не влияет, отключает DDoS-защиту Vercel. Решать при желании.

**14.10.2026 (проверить ~2026-10-28):**
- В индексе 143/216 (8.09 было 125). Клики 28д 59→76, показы 5741→8989, позиция 33→19,5.
- `/es/servicios` переделан (группы + описания + «как выбрать», 500→1500 слов, lastmod 2026-10-14).
- На переобход запрошены: `/es/servicios`, `fibra-optica-empresas` (Google считал её дублем
  казино `747live.bet`, наш HTML чистый), `red-casa`, `fibra-optica-barcelona`, `granollers`,
  `badalona`, `cat6a`, `cat7`, блог `como-elegir-instalador-red-barcelona`.
- Перепроверка: `node scripts/gsc-index-status.mjs` (все URL sitemap + трафик 28д/28д).

**Безопасность (аудит 17.10.2026):**
- Модель доступа: всё ходит через сервер с `SUPABASE_SERVICE_ROLE_KEY`. У `anon`/`authenticated`
  доступа к таблицам быть не должно; новые таблицы — с RLS и **без** политик. Supabase Auth не используется.
  Фолбэков на anon/publishable-ключ в коде нет и не добавлять.
- Серверные действия `crm.ts` начинаются с `await assertAdmin()` (`src/lib/admin-guard.ts`: Basic
  admin или Bearer `CRON_SECRET`). Каждое новое экспортируемое действие — тоже с ним.
- `/api/leads`, `/api/quotes`: лимит 5 заявок/10 мин на IP (`src/lib/rate-limit.ts`, в памяти инстанса)
  и потолок 5000 символов на поле. Для настоящей защиты от флуда — правило rate limit в Cloudflare.
- Миграция `supabase/migrations/20261017_security_hardening.sql`: функция `reset_invoice_sequence`
  закрыта (применено); блок `harden_rls_and_grants` — проверить, применён ли (`list_migrations`).
- В истории git (коммиты май 2026) лежал legacy `service_role` JWT. Legacy-ключи в проекте отключены —
  держать отключёнными. Репозиторий должен быть приватным.
- Остаётся: Next 14 и next-intl 3 имеют уязвимости, исправленные только в Next 15.5+/next-intl 4 —
  отдельная миграция. Полный CSP не настроен (только `frame-ancestors`).

**Полезно знать:**
- Локальный `next build` падает без `SUPABASE_SERVICE_ROLE_KEY` (сбор данных
  `/api/photos`). Для проверки сборки подставить фиктивные env — это не регрессия.
- Кроны: `npx vercel crons ls` и `npx vercel crons run <path>` — так проверяется,
  жив ли крон, не дожидаясь расписания.

---
*Обновлено 2026-09-10. Исходный контекст создан Antigravity AI 2026-05-10.*
