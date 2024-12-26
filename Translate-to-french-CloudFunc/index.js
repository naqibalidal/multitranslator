const functions = require('@google-cloud/functions-framework');
const {Translate} = require('@google-cloud/translate').v2;
const {Firestore} = require('@google-cloud/firestore'); // Import Firestore client
const {Storage} = require('@google-cloud/storage');  // Import Storage client
const projectId = 'My_Project';
const firestore = new Firestore();  // Initialize Firestore client
const storage = new Storage();  // Initialize Storage client

// Define the Cloud Storage bucket name
const bucketName = 'lab-activity-2-bucket';  // bucket name

const translate = new Translate({projectId});
// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub', async cloudEvent => {
   // The Pub/Sub message is passed as the CloudEvent's data payload.
  console.log('Function started translating into french');
  const target= 'fr';
  
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const pubsubMessage = cloudEvent.data.message.data;
  const messageText = Buffer.from(pubsubMessage,'base64').toString();
  
  // console out put for debugging
  console.log('Message Data:', messageText);
  
  // Parse the message (assuming it's a JSON string)
  let messageData;
  try {
    messageData = JSON.parse(messageText);
  } catch (error) {
    console.error('Error parsing message data:', error);
    return;
  }

  // Extract referenceCode and concernMessage from the parsed data
  const generatedId = messageData.code;
  const textDecoded = messageData.message;

  const [translation] = await translate.translate(textDecoded, target);
  console.log(`Text to translate: ${textDecoded}!`);
  console.log(`Translation: ${translation}`)

  const translatedFileName = `${generatedId}-french.txt`;

  // Define Cloud Storage folder paths
  const translatedFilePath = `french/${translatedFileName}`;

  // Upload the translated text to Cloud Storage under the "spanish" folder
  await storage.bucket(bucketName).file(translatedFilePath).save(translation);
  console.log(`Translated text uploaded to Cloud Storage at ${translatedFilePath}`);

});