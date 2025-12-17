# PersonalLeadSys

מערכת ניהול אישית.

## הרצות ובדיקות אחרונות
- `npm run build` – מסתיים בהצלחה.
- אזהרה קיימת מ־npm: "Unknown env config \"http-proxy\"". היא נובעת מהגדרה סביבתית חיצונית (`npm_config_http_proxy`) ואינה מפילה את הבילד. ניתן להסיר אותה עם `npm config delete http-proxy` או על ידי ניקוי משתנה הסביבה לפני הרצה.
- דוח הרצה מפורט זמין ב־[`docs/build-report.md`](docs/build-report.md).

## הרצה מקומית ותצוגה
- התחברו לשירות ה־MySQL/‏API שלכם (הלקוח מצפה לראות דאשבורד כמו בצילומי המסך המצורפים).
- הפעילו את סביבת הפיתוח עם `npm run dev` וגשו ל־`http://localhost:4173`.
- התחברות ברירת מחדל: משתמש `admin` וסיסמה `empire2025` (ניתן לשנות בקובץ `src/contexts/AuthContext.jsx`).
- הנתונים המקומיים נשמרים ב־`localStorage`; כשה־API מול MySQL זמין, חברו את הקריאות הרלוונטיות במקום ה־seed המקומי לקבלת נתונים חיים.
