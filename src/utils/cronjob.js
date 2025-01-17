const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

//everyday at 8am
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
    console.log(emailList);

    for (const email of emailList) {
      try {
        const res = await sendEmail.run(
          `New Friend request pending for ${email}`,
          `There are so many pending requests, please login to your account to accept the requests`
        );
        console.log(res);
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw new Error(`Error sending email to ${email}`);
      }
    }
  } catch (error) {}
});
