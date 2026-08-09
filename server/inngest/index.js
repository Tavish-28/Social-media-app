import { Inngest } from "inngest";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Message from "../models/message.js";
import Story from "../models/Story.js";

export const inngest = new Inngest({ id: "my-app" });

const getConnectionParticipants = async (connectionId) => {
  const connection = await Connection.findById(connectionId).lean();
  if (!connection) return null;

  const [fromUser, toUser] = await Promise.all([
    User.findOne({ id: connection.from_user_id }).lean(),
    User.findOne({ id: connection.to_user_id }).lean(),
  ]);

  if (!fromUser || !toUser) return null;
  return { connection, fromUser, toUser };
};

const buildConnectionEmail = (fromUser, toUser) => ({
  subject: "New connection request",
  body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${toUser.full_name},</h2>
  <p>You have a new connection request from ${fromUser.full_name} - @${fromUser.username}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request.</p>
  <br/>
  <p>Thanks,<br/>PingUp - Stay Connected</p>
</div>`,
});

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    let username = email_addresses[0].email_address.split("@")[0];
    const user = await User.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await User.create({
      id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    });
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

    await User.findOneAndUpdate(
      { id },
      {
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
      },
    );
  },
);

const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;
    await Promise.all([
      User.findOneAndDelete({ id }),
      Connection.deleteMany({
        $or: [{ from_user_id: id }, { to_user_id: id }],
      }),
    ]);
  },
);

const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "send-new-connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    const request = await step.run("get-connection-request", () =>
      getConnectionParticipants(connectionId),
    );
    if (!request || request.connection.status !== "pending") {
      return { sent: false, reason: "Connection request is unavailable" };
    }

    await step.run("send-connection-request-mail", async () => {
      const { subject, body } = buildConnectionEmail(
        request.fromUser,
        request.toUser,
      );
      await sendEmail({ to: request.toUser.email, subject, body });
    });

    await step.sleepUntil(
      "wait-for-24-hours",
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    const reminder = await step.run("get-pending-connection-request", () =>
      getConnectionParticipants(connectionId),
    );
    if (!reminder || reminder.connection.status !== "pending") {
      return { sent: false, reason: "Connection request was already handled" };
    }

    await step.run("send-connection-request-reminder", async () => {
      const { subject, body } = buildConnectionEmail(
        reminder.fromUser,
        reminder.toUser,
      );
      await sendEmail({ to: reminder.toUser.email, subject, body });
    });

    return { sent: true };
  },
);
//inngest fucntion to delete story in 24 hrs
const deleteStory = inngest.createFunction(
  { id: "story-delete", triggers: [{ event: "app/story.delete" }] },
  async ({ event, step }) => {
    const { storyId } = event.data;

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await step.sleepUntil("wait-for-24-hours", in24Hours);

    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);

      return { message: "Story deleted." };
    });
  },
);

const sendNotiUnseenMsg = inngest.createFunction(
  {
    id: "send-unseen-msg-noti",
    triggers: [{ cron: "TZ=America/New_York 0 9 * * *" }],
  },
  async () => {
    const messages = await Message.find({ seen: false }).lean();
    const unseenCount = {};
    messages.map((message) => {
      unseenCount[message.to_user_id] =
        (unseenCount[message.to_user_id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await User.findOne({ id: userId });
      if (!user) continue;

      const subject = `📩 You have ${unseenCount[userId]} unseen messages`;

      const body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hi ${user.full_name},</h2>
            <p>You have ${unseenCount[userId]} unseen messages</p>
            <p>
                Click <a href="${process.env.FRONTEND_URL}/messages"
                style="color: #10b981;">here</a> to view them
            </p>
            <br/>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
        </div>
    `;
      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }
    return { message: "Noti. sent" };
  },
);
export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotiUnseenMsg,
];
