# PersonalLeadSys – הגדרת בסיס נתונים ושרת Express
מסמך זה מוסיף Backend מינימלי עם MySQL שתואם למודלים הקיימים במערכת ה־Frontend. הוא כולל סכמה מלאה, סקריפט seed, והוראות הפעלה.

## 1. יצירת מסד נתונים והזרעת נתוני דמו
1. התקן MySQL (גרסה 8 מומלצת) והפעל שרת.
2. הרץ את סקריפט הסכמה וה־seed:
   ```bash
   mysql -u root -p < db/schema.sql
   ```
   הסקריפט:
   - יוצר בסיס נתונים `personal_lead_sys` עם טבלאות Leads, Projects, Channels, Tasks, FAQ/Templates ויומן פעילות.
   - מוסיף משתמש ברירת מחדל `admin@example.com`/`empire2025` (הסיסמה כבר מגובבת ב־bcrypt).
   - מזריק נתוני דמו בסיסיים להתנסות.

## 2. קובץ סביבה
העתק את `.env.example` שנמצא בתיקיית `server/`:
```bash
cp server/.env.example server/.env
```
עדכן את המשתנים לפי סביבתך:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – פרטי התחברות ל־MySQL
- `APP_PORT` – פורט ה־API (ברירת מחדל 4000)
- `CORS_ORIGIN` – כתובת ה־Frontend (למשל `http://localhost:5173` או דומיין הפרודקשן)

## 3. התקנת תלויות Backend
בתיקיית `server/` הרץ:
```bash
npm install
```
> אם הרשת חוסמת התקנה, ניתן להתקין חבילות ידנית מה־tarballs או מחנות פנימית. נדרשות הספריות: `express`, `mysql2`, `cors`, `dotenv`, `bcryptjs`.

## 4. הרצת שרת ה־API
```bash
cd server
npm run start
```
מסלול ברירת המחדל: `http://localhost:4000`.

בדיקת בריאות:
```bash
curl http://localhost:4000/health
```
תשובה תקינה: `{ "ok": true }`.

## 5. נקודות קצה עיקריות
- `POST /auth/login` – התחברות עם אימייל + סיסמה (מחזיר פרטי משתמש בסיסיים).
- `GET /projects` – רשימת פרויקטים/קמפיינים.
- `GET /channels` – רשימת ערוצי שיווק.
- `GET /leads` – רשימת לידים + שיוכים לפרויקטים/ערוצים.
- `POST /leads` – יצירת ליד חדש (`full_name` חובה; אפשר לצרף `project_id`, `channel_id`, `status`, `tags`, `notes`).
- `PUT /leads/:id` – עדכון סטטוס/הערות לליד.
- `GET /tasks` / `POST /tasks` – משימות על לידים.
- `GET /faq` – תבניות שאלות נפוצות.
- `GET /messages/templates` – תבניות הודעות (מייל/SMS/וואטסאפ).

## 6. מיפוי ל־Frontend הקיים
- משתמש ברירת מחדל זהה ל־Seed של ה־Frontend (`admin / empire2025`).
- ניתן להחליף את קריאות ה־localStorage בקריאות HTTP ל־API לעיל כדי להתמיד נתונים אמיתיים.
- מבנה הטבלאות תואם לישויות שמוגדרות ב־`src/utils/seed.js` (לידים, משימות, תבניות FAQ/הודעות).

## 7. פריסה ב־public_html
1. בצע build ל־Frontend כרגיל (`npm run build`) והעלה את תיקיית `dist` ל־`public_html`.
2. פרוס את השרת (Node/PM2 או Docker) על אותו שרת, עם חיבור ל־MySQL.
3. ודא שה־CORS ב־`.env` מכוון לדומיין של ה־Frontend, ושפורט ה־API פתוח.

## 8. גיבוי ושחזור
- גיבוי יומי: `mysqldump personal_lead_sys > backup.sql`
- שחזור: `mysql -u <user> -p personal_lead_sys < backup.sql`

## 9. אימות הרשאות
- טבלת `users` כוללת עמודת `role` (`admin`/`manager`/`agent`).
- בעתיד ניתן להוסיף JWT/סשנים; כעת ה־API מחזיר פרטי משתמש בלבד ומצופה מה־Frontend לשמור סשן.
