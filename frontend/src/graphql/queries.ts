import { gql } from "@apollo/client";

export const GET_MY_EMAILS = gql`
  query MyEmails {
    myEmails {
      id
      from
      subject
      datetime
      status
      confidence
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
