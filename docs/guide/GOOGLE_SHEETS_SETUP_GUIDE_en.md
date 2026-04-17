# Google Sheets Integration Guide

This document provides instructions on how to set up a Google Service Account and obtain the necessary JSON key to use the Google Sheets export feature in TestcaseCraft.

---

## 🚀 Setup Steps Summary

To use the Google Sheets export feature, you must create a **Google Service Account** and register the issued **JSON key** in the application.

### Step 1: Prepare Google Cloud Project
1. Access and log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select a project from the top bar or create a **[New Project]**.

### Step 2: Enable APIs
1. Go to the **[APIs & Services] > [Library]** menu.
2. Search for **"Google Sheets API"** and click the **[Enable]** button.

### Step 3: Create Service Account and Key
1. Go to the **[IAM & Admin] > [Service Accounts]** menu.
2. Click **[+ CREATE SERVICE ACCOUNT]** at the top and create an account (choose any name).
3. Click the **[Manage]** menu or the email address of the created account to enter the details screen.
4. Select the **[Keys]** tab and click **[Add Key] > [Create new key]**.
5. Select **JSON** as the key type and click the Create button. The file will be downloaded automatically.

### Step 4: Register in Application
1. Open the downloaded JSON file with a text editor and copy the **entire content**.
2. In the application, go to the **[Avatar Menu at Top Right] > [Google Sheets Settings]** page.
3. Paste the copied JSON content into the input field and click **[Save Integration Settings]**.

### Step 5: Grant Permissions to Target Google Sheet (Required)
> [!IMPORTANT]
> If you skip this step, you will encounter a 'Permission Denied' error.
1. Open the **Google Sheet file** where you want to export data.
2. Click the **[Share]** button at the top right.
3. Add the **Email Address** of the service account (the `client_email` value in the JSON).
4. Set the permission to **'Editor'** and save.

---

## ❓ Frequently Asked Questions

### Q: I'm getting a "Permission Denied" error.
A: Check the 'Share Google Sheet' setting in Step 5. The service account email must be registered as an editor for that specific sheet.

### Q: I want to export to multiple sheets.
A: Simply perform Step 5 for every Google Sheet file you wish to export to.

### Q: I want to change my credentials.
A: On the settings page, you can disconnect the existing integration or paste new JSON content and update it to change credentials immediately.
