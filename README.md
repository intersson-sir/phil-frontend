# Phil Frontend

CRM-система для управления негативными ссылками — фронтенд на Next.js.

## Стек

- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS 4, shadcn/ui
- Recharts, date-fns, Lucide

## Быстрый старт (локально)

### Требования

- Node.js 20+
- Запущенный бэкенд (см. [phil-backend](https://github.com/intersson-sir/phil-backend))

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/intersson-sir/phil-frontend.git
cd phil-frontend

# Установить зависимости
npm install

# Создать файл с переменными окружения
cp .env.production.example .env.local
```

Открыть `.env.local` и заполнить:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000   # URL бэкенда
NEXT_PUBLIC_USE_MOCK=false                  # true — работать без API (мок-данные)
```

### Запуск

```bash
npm run dev
```

Приложение доступно на [http://localhost:3000](http://localhost:3000)

---

## Запуск через Docker

```bash
docker compose up --build
```

Приложение доступно на [http://localhost:3000](http://localhost:3000)

Для настройки URL API отредактируйте `docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL Django бэкенда | `http://localhost:8000` |
| `NEXT_PUBLIC_USE_MOCK` | Использовать мок-данные без API | `false` |

---

## Скрипты

```bash
npm run dev      # Режим разработки
npm run build    # Production-сборка
npm run start    # Запуск production-сборки
npm run lint     # Проверка кода
```

---

## Структура проекта

```
app/          — страницы (App Router)
components/   — UI-компоненты
  platform/   — компоненты CRM
  ui/         — shadcn/ui базовые компоненты
hooks/        — кастомные React-хуки
lib/          — утилиты, API-клиент
types/        — TypeScript-типы
public/       — статические файлы
```
