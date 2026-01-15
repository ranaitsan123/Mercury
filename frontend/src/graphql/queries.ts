import { gql } from "@apollo/client";

export const GET_MY_EMAILS = gql`
  query MyEmails($folder: String, $limit: Int, $offset: Int) {
    myEmails(folder: $folder, limit: $limit, offset: $offset) {
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
    sendEmail(to: $recipient, subject: $subject, body: $body) {
      success
      message
      email {
        id
        subject
      }
    }
  }
`;
