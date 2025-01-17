const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  if (!body || !subject) {
    throw new Error("Email subject and body must not be null or undefined.");
  }

  const plainTextBody = body.replace(/<[^>]*>?/gm, ""); // Convert HTML to plain text

  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
        Text: {
          Charset: "UTF-8",
          Data: plainTextBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
  });
};

const run = async (subject, body) => {
  const toAddress = "danialwood6900@gmail.com"; // Hardcoded recipient email
  const fromAddress = "agrimgupta0805@gmail.com"; // Hardcoded sender email

  const sendEmailCommand = createSendEmailCommand(
    toAddress,
    fromAddress,
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught; // Handle MessageRejected error
    }
    throw caught; // Re-throw other errors
  }
};

module.exports = { run };
