An Social Media app

~ This is an sicial media app

~ Here first you need to sign up (I have used the CLERK for the autentication )

~ After the signup You would see the home-page like this

![alt text](images/image.png)

~Initially there would be no recent messages section Since you have not followed anyone

~Than you need to go to the Discover section you would be seeing a page like this

![alt text](images/image-1.png)

~After following few people

~ go to messages section it would look like

![alt text](images/image-2.png)

~Sometimes if the server is slow than it could show the Loading,Like: this

~No need to worry it would be gone once the data is retrieved from the server

~ Click the message icon beside every contact
~you would be directed to a page like

![alt text](images/image-4.png)

~ In the Profile section you would see

![alt text](images/image-6.png)

![alt text](images/image-7.png)

~ You could edit the profile by clicking the "Edit profile " button

![alt text](images/image10.png)

@@ Setting up the project on local System:

1. Install Dependencies

Open terminal in project root:

cd "C:\Users\Administrator\Desktop\social media app"

cd server
npm install

cd ..\client
npm install

2. Create server/.env

PORT=4000
FRONTEND_URL=http://localhost:5173

MONGODB_URL=your_mongodb_connection_string
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

SENDER_EMAIL=your_sender_email
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

3. Create client/.env

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASEURL=http://localhost:4000

4. Start Backend

In one terminal:

cd server
npm run server

Backend runs on:

http://localhost:4000

5. Start Frontend

In another terminal:

cd client
npm run dev

Frontend runs on:

http://localhost:5173
