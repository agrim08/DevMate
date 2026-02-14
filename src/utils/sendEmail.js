import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.js";

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

/**
 * Sends an email using AWS SES.
 * @param {string} subject - The subject of the email.
 * @param {string} body - The HTML body of the email.
 */
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
      return caught;
    }
    throw caught;
  }
};

export { run };
