import { gql } from '@apollo/client';

/**
 * Query to fetch the current user's emails.
 */
export const MY_EMAILS = gql`
  query MyEmails {
    myEmails {
      id
      sender
      recipient
      subject
      body
      folder
      createdAt
    }
  }
`;

/**
 * Query to fetch the current user's scan logs.
 */
export const MY_SCAN_LOGS = gql`
  query MyScanLogs {
    myScanLogs {
      id
      result
      confidence
      createdAt
      email {
        subject
      }
    }
  }
`;

/**
 * Admin-only query to fetch all scan logs in the system.
 */
export const ALL_SCAN_LOGS = gql`
  query AllScanLogs {
    allScanLogs {
      id
      user {
        id
        email
      }
      scanDate
      status
      threatsDetected
      details
    }
  }
`;
