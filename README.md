# Coursefar Learning Platform

Coursefar is a Persian RTL learning-management platform built with React, TypeScript, Vite, Express, SQLite, Zod, Helmet, and Lucide React. It follows the selected **Modern SaaS Learning** visual direction and connects the student, instructor, and administrator experiences through one persistent database.

## What is included

- Session-based authentication with an HttpOnly cookie and CSRF protection for state-changing requests.
- Role-based access for Student, Instructor, and Administrator accounts.
- Persistent SQLite data for users, instructor profiles, courses, learning paths, enrollments, bookmarks, and activities.
- Twenty seeded professional courses across programming, frontend, backend, AI, data, UI/UX, Power BI, Excel, and cybersecurity.
- Ten interactive learning paths with ordered courses, prerequisites, learning outcomes, reasons, and next steps.
- Eight fictional demo instructor profiles with generated portrait assets. They are labeled as demo content.
- Course catalog search, category filters, course detail pages, instructor profiles, enrollment, bookmarks, lesson progress, and responsive layouts.
- Instructor course creation and publication. A published course becomes available in the public catalog.
- Administrator overview, user status management, platform statistics, course counts, and enrollment relationships.
- Light/dark theme, Persian RTL typography, responsive mobile layouts, loading and empty states.
- Reusable `UserAvatar` component with initials/icon placeholders, responsive cropping, and Arash Nozari focus positioning.
- Frontend-only profile photo settings for students and instructors with IndexedDB storage, preview, validation, replacement, and removal. New public registrations start without a photo.

## Requirements

- Node.js 24 or newer. The server uses Node's built-in `node:sqlite` module so no native SQLite package compilation is needed.

## Run locally

```bash
npm install
npm run dev
```

The Vite client runs on the URL printed by Vite and proxies `/api` requests to the Express API on port `3001`.

For a production-style run:

```bash
npm run build
npm start
```

The Express server serves `dist` and the API from the same origin.

## Demo accounts

All demo accounts use the password `demo`.

| Role | Email |
| --- | --- |
| Student | `student@coursefar.test` |
| Instructor | `instructor@coursefar.test` |
| Administrator | `admin@coursefar.test` |

Public registration accepts Student and Instructor roles. Administrator privileges are never granted through public registration.

## Validation

```bash
npm run typecheck
npm run lint
npm run test:api
npm run build
```

The API tests cover the public catalog seed, role guards, CSRF rejection, student enrollment, instructor visibility, administrator statistics, and the no-default-avatar registration rule.

## Project structure

```text
src/                 React application, data contracts, API client, RTL UI
server/              Express API, SQLite schema/seeding, password/session security
public/assets/       Course covers and fictional instructor portrait assets
tests/               API integration tests
```

## Persistence and security notes

SQLite is the source of truth for the demo application. The database file is created at `server/data/coursefar.sqlite` and is intentionally ignored by Git. Passwords are stored as scrypt-derived hashes. Sessions are held server-side and the browser receives an HttpOnly cookie; production deployments should run behind HTTPS so the cookie can use the Secure attribute.

This is a portfolio-ready frontend plus a small demonstration backend. It is not a payment system, a production file-upload service, or a production identity provider. Profile photos selected in the UI are validated locally and stored as image Blobs in IndexedDB for the current browser/device. Only lightweight theme preferences use Local Storage; photos do not synchronize between devices. Course cover uploads remain part of the instructor demo workflow, and certificate issuing remains outside this demo scope.
