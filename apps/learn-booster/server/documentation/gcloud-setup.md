# הגדרת חשבון שירות של גוגל באמצעות gcloud CLI

## התקנת gcloud CLI
1. התקנת gcloud CLI מהאתר הרשמי:
   ```
   https://cloud.google.com/sdk/docs/install
   ```

2. אימות והתחברות:
   ```bash
   gcloud auth login
   ```

## יצירת פרויקט והגדרת הרשאות

1. יצירת פרויקט חדש:
   ```bash
   gcloud projects create [PROJECT_ID] --name="[PROJECT_NAME]"
   ```
   לדוגמה:
   ```bash
   gcloud projects create gingim-booster --name="Gingim Booster"
   ```

2. הגדרת הפרויקט כברירת מחדל:
   ```bash
   gcloud config set project [PROJECT_ID]
   ```

3. הפעלת Google Drive API:
   ```bash
   gcloud services enable drive.googleapis.com
   ```

4. יצירת חשבון שירות:
   ```bash
   gcloud iam service-accounts create [SERVICE_ACCOUNT_ID] \
     --description="[DESCRIPTION]" \
     --display-name="[DISPLAY_NAME]"
   ```
   לדוגמה:
   ```bash
   gcloud iam service-accounts create share-files \
     --description="Service account for accessing Drive files" \
     --display-name="Share Files Service Account"
   ```

5. הורדת מפתח חשבון השירות:
   ```bash
   gcloud iam service-accounts keys create credentials.json \
     --iam-account=[SERVICE_ACCOUNT_ID]@[PROJECT_ID].iam.gserviceaccount.com
   ```
   לדוגמה:
   ```bash
   gcloud iam service-accounts keys create credentials.json \
     --iam-account=share-files@gingim-booster.iam.gserviceaccount.com
   ```

## הרשאות נדרשות

1. הוספת הרשאת Viewer לחשבון השירות:
   ```bash
   gcloud projects add-iam-policy-binding [PROJECT_ID] \
     --member="serviceAccount:[SERVICE_ACCOUNT_ID]@[PROJECT_ID].iam.gserviceaccount.com" \
     --role="roles/viewer"
   ```

2. שיתוף קבצים בגוגל דרייב:
   - יש לשתף את הקבצים הרצויים עם כתובת המייל של חשבון השירות
   - מספיקה הרשאת צפייה (Viewer) לקבצים

## בדיקת ההגדרות

1. בדיקת הפרויקט הנוכחי:
   ```bash
   gcloud config get-value project
   ```

2. בדיקת חשבונות שירות בפרויקט:
   ```bash
   gcloud iam service-accounts list
   ```

3. בדיקת API מופעלים:
   ```bash
   gcloud services list
   ```

## הערות
- יש לוודא שקובץ credentials.json נמצא בתיקיית הפרויקט
- יש לשמור על קובץ ההרשאות בצורה מאובטחת
- אין לכלול את קובץ ההרשאות ב-git (הוא כבר נמצא ב-.gitignore)
