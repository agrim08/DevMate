import cron from "node-cron";
import { subDays, startOfDay, endOfDay } from "date-fns";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { run as sendEmailRun } from "./sendEmail.js";

/**
 * Scheduled task to send email reminders for pending connection requests.
 * Runs every day at 8:00 AM.
 */
cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequest = await ConnectionRequestModel.find({
      status: "pending",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");
    
    const emailList = [
      ...new Set(pendingRequest.map((req) => req.toUserId.emailId)),
    ];

    for (const email of emailList) {
      try {
        await sendEmailRun(
          `New connection requests pending for ${email}`,
          `You have pending connection requests on DevMate. Please login to your account to review them.`
        );
      } catch (error) {
        console.error(`Failed to send reminder email to ${email}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
