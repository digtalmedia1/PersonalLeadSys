# PersonalLeadSys
מערכת ניהול אישית

## MySQL setup
1. פתח מסד נתונים וחשבונות גישה ב-MySQL (למשל root או משתמש ייעודי).
2. הרץ את הסכמה והדאטה לדמו:
   ```bash
   mysql -u <user> -p < tools/mysql/schema-and-demo.sql
   ```
3. ודא שה-API שלך משתמש במסד הנתונים `personal_lead_sys` ומחזיר JSON עם השדות שהפרונט מצפה להם (`/projects`, `/leads`, `/channels`, `/faq-templates`, `/tasks`, `/messages`).
4. בקובץ `.env` של ה-frontend הגדר `VITE_API_BASE_URL` לכתובת ה-API שלך (למשל `http://localhost:3000/api`).

## Deployment / הרצה על שרת
1. **משיכה מגיטהאב:**
   ```bash
   git clone <repo-url>
   cd PersonalLeadSys
   ```
2. **התקנת תלויות Node (Node 18+):**
   ```bash
   npm install
   ```
3. **הגדרת משתנים:** צור קובץ `.env` עם `VITE_API_BASE_URL` שמצביע לשרת ה-API שלך (לדוגמה `https://your-domain.com/api`).
4. **בניית הפרונט:**
   ```bash
   npm run build
   ```
   הפקודה תיצור את התיקייה `dist/` עם קבצים סטטיים.
5. **פריסה:** העלה את תוכן `dist/` לשרת סטטי (Nginx/Apache/S3/CloudFront) או הרץ על השרת:
   ```bash
   npm run preview -- --host --port 4173
   ```
   ודא ש-Nginx/Reverse-proxy מפנה ליציאת ה-preview או מגיש את הקבצים מ-`dist/`.
6. **חיבור ל-API ו-MySQL:** בדוק שה-API החיצוני פועל ומחובר ל-MySQL עם הסכמה שסופקה; הפרונט יצרוך נתונים דרך `fetch` לנקודות הקצה שהוגדרו.

## בדיקות
- `npm run build` בודק שהפרויקט נבנה בהצלחה.
