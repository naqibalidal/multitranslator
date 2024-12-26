const functions = require('@google-cloud/functions-framework');
const {PubSub} = require('@google-cloud/pubsub');
const {Firestore} = require('@google-cloud/firestore'); // Import Firestore client
const {Storage} = require('@google-cloud/storage');  // Import Storage client
const pubsub = new PubSub();
const firestore = new Firestore();  // Initialize Firestore client
const storage = new Storage();  // Initialize Storage client

// Define the Cloud Storage bucket name
const bucketName = 'lab-activity-2-bucket';  // bucket name

// Replace with your Pub/Sub topic name
const TOPIC_NAME = 'projects/lab-activity-2-442319/topics/translator';

functions.http('helloHttp', async (req, res) => {
  //res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
    try {
    // Check for POST request
    if (req.method !== 'POST') {
      return res.status(405).send('Only POST requests are allowed.');
    }

    // Retrieve the input message from the body of the request
    const inputMessage = req.body.message;
    if (!inputMessage) {
      return res.status(400).send('Missing "message" in the request body.');
    }

    // Generate a unique ID for this translation (using timestamp or UUID)
    const generatedCode = `trans-${Date.now()}`;

    // Prepare the payload to publish to Pub/Sub
    const payload = {
      code: generatedCode,
      message: inputMessage,
    };

    // Publish the message to Pub/Sub topic
    const messageBuffer = Buffer.from(JSON.stringify(payload));
    await pubsub.topic(TOPIC_NAME).publish(messageBuffer);

        // Define Cloud Storage file names
    const originalFileName = `${generatedCode}-original.txt`;
    const frenchFileName = `${generatedCode}-french.txt`;
    const spanishFileName = `${generatedCode}-spanish.txt`;

    // Define Cloud Storage folder paths
    const originalFilePath = `original/${originalFileName}`;
    const frenchFilePath = `french/${frenchFileName}`;
    const spanishFilePath = `spanish/${spanishFileName}`;

    // Upload the original text to Cloud Storage under the "original" folder
    await storage.bucket(bucketName).file(originalFilePath).save(inputMessage);
    console.log(`Original text uploaded to Cloud Storage at ${originalFilePath}`);

     // Save the locations of both files in Firestore
    const translationDoc = firestore.collection('translation-logs').doc(generatedCode);

    await translationDoc.set({
        originalTextFileLocation: `gs://${bucketName}/${originalFilePath}`,
        frenchTextFileLocation: `gs://${bucketName}/${frenchFilePath}`,
        spanishTextFileLocation: `gs://${bucketName}/${spanishFilePath}`,
        translatedAt: new Date().toISOString(),
        generatedId: generatedCode,
    });
    original_url=`https://storage.googleapis.com/lab-activity-2-bucket/${originalFilePath}`;
    french_url=`https://storage.googleapis.com/lab-activity-2-bucket/${frenchFilePath}`;
    spanish_url=`https://storage.googleapis.com/lab-activity-2-bucket/${spanishFilePath}`;
    // Send a response back to the HTTP request
    res.status(200).send(`Message published with code: ${generatedCode} \n Original_Url: ${original_url} \n French_Url: ${french_url} \n Spanish_Url: ${spanish_url}`);
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).send('Internal Server Error');
  }
});
