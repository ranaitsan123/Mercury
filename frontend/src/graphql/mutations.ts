import { gql } from "@apollo/client";

/**
 * =========================
 * ✉️ SEND EMAIL
 * =========================
 * Backend source:
 * mutation SendEmail(to, subject, body)
 */
export const SEND_EMAIL_MUTATION = gql`
  mutation SendEmail($to: String!, $subject: String!, $body: String!) {
    sendEmail(to: $to, subject: $subject, body: $body) {
      email {
        id
        sender
        recipient
        subject
        body
        folder
        createdAt
        scan {
          result
          confidence
        }
      }
    }
  }
`;
