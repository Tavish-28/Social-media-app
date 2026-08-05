import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    // Check availability of the username
    const user = await User.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    };

    await User.create(userData);
  },
);
const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const updatedUserData = {
      // _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      // username,
    };
    await User.findOneAndUpdate({ id }, updatedUserData);
  },
);
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findOneAndDelete({ id });
  },
);
// Create an empty array where we'll export future Inngest functions
// Inngest Function to send Reminder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    const connection = await step.run("get-connection", async () => {
      return Connection.findById(connectionId).lean();
    });

    if (!connection) return { sent: false, reason: "Connection not found" };

    const [fromUser, toUser] = await step.run("get-users", async () => {
      return Promise.all([
        User.findOne({ id: connection.from_user_id }).lean(),
        User.findOne({ id: connection.to_user_id }).lean(),
      ]);
    });

    if (!fromUser || !toUser) return { sent: false, reason: "User not found" };

    await step.run("send-connection-request-mail", async () => {
      return sendEmail({
        to: toUser.email,
        subject: "You have a new connection request",
        body: `<p><strong>${fromUser.full_name}</strong> sent you a connection request.</p>`,
      });
    });

    return { sent: true };
  },
);
export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
];
