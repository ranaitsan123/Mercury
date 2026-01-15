import { gql } from "@apollo/client";

export const GET_MY_EMAILS = gql`
  query MyEmails($folder: String) {
    myEmails(folder: $folder) {
      id
      sender
      recipient
      subject
      createdAt
      scan {
        result
        confidence
      }
    }
  }
`;

export const GET_MY_SCAN_LOGS = gql`
  query MyScanLogs {
    myScanLogs {
      id
      from
      subject
      datetime
      status
      confidence
    }
  }
`;

export const SEND_EMAIL_MUTATION = gql`
  mutation SendEmail($recipient: String!, $subject: String!, $body: String!) {
    sendEmail(recipient: $recipient, subject: $subject, body: $body) {
      success
      message
      email {
        id
        subject
      }
    }
  }
`;
