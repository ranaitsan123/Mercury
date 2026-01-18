import { gql } from "@apollo/client";

/**
 * =========================
 * 📩 FETCH USER EMAILS
 * =========================
 * Backend source:
 * query MyEmails(folder, limit, offset)
 */
export const GET_MY_EMAILS = gql`
  query MyEmails($folder: String, $limit: Int, $offset: Int) {
    myEmails(folder: $folder, limit: $limit, offset: $offset) {
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
`;

/**
 * =========================
 * 🧪 FETCH SCAN LOGS
 * =========================
 * Backend source:
 * query MyScanLogs
 */
export const GET_MY_SCAN_LOGS = gql`
  query MyScanLogs($limit: Int, $offset: Int) {
    myScanLogs(limit: $limit, offset: $offset) {
      id
      result
      confidence
      createdAt
      email {
        id
        subject
        sender
        recipient
        body
        createdAt
      }
    }
  }
`;

/**
 * =========================
 * ❌ REMOVED ON PURPOSE
 * =========================
 * Sending emails is REST-only:
 * POST /emails/send/
 *
 * GraphQL mutation removed to avoid 400 errors
 */
// export const SEND_EMAIL_MUTATION = ...
