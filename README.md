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
