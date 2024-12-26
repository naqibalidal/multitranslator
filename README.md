# MultiTranslator

## What application does:

The goal of this task is to build a system that allows users to input a text message, which is then translated into multiple languages (e.g., French, Spanish) and stored in Google Cloud Storage. Additionally, metadata regarding the translations (file locations, generated code, etc.) is stored in Firestore. The entire workflow is orchestrated using Google Cloud Functions and Pub/Sub, allowing for scalable and asynchronous handling of translation requests.

## Functionality 

The first **Cloud Function “publisher”** receives a POST request containing an input text. Then it generates a unique code. Publisher combines input text and unique code and published them to **Pub/Sub topic.**

The Cloud Function **“translate-to-french”** and **“translate-to-spanish”** are both subscribed to the pu b/sub topic and are triggered by the Pub/Sub message and translates the message into French and Spanish respectively using the Google Cloud Translation API.

The original text and translated text are stored in the **Google Cloud Storage bucket** “lab-activity-2-bucket” under a specified folder, each file name starts with the generated code and ends with either “original”, “spanish” or “french”. The storage path of all the files along with timestamps is logged in Firestore.

Finally, URLs pointing to the stored files are returned to the user, providing access to both the original and translated files.

### Format to invoke api post method: 
 
```javascript
{
  "message": "The quick brown fox jumps over the lazy dog"
}
```

