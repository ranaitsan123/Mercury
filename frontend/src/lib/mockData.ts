import { EmailLog, Threat } from "./data";

export const MOCK_EMAIL_LOGS: EmailLog[] = [
    { id: "1", sender: "marketing@example.com", recipient: "user@example.com", subject: "Exclusive Offer Just For You!", createdAt: "2025-12-27T10:30:15Z", folder: "inbox", scan: { result: "safe", confidence: 0.998 } },
    { id: "2", sender: "support@verified-bank.com", recipient: "user@example.com", subject: "Action Required: Your Account is Locked", createdAt: "2025-12-27T10:28:45Z", folder: "inbox", scan: { result: "malicious", confidence: 0.952 } },
    { id: "3", sender: "hr-department@company.net", recipient: "user@example.com", subject: "Updated Company Policy", createdAt: "2025-12-27T10:25:02Z", folder: "inbox", scan: { result: "safe", confidence: 0.999 } },
    { id: "4", sender: "random-user@proton.me", recipient: "user@example.com", subject: "FW: Urgent Invoice Payment", createdAt: "2025-12-27T10:22:18Z", folder: "inbox", scan: { result: "dangerous", confidence: 0.785 } },
    { id: "5", sender: "contact@your-cloud-storage.io", recipient: "user@example.com", subject: "Your storage is almost full", createdAt: "2025-12-27T10:19:55Z", folder: "inbox", scan: { result: "safe", confidence: 0.995 } },
    { id: "6", sender: "winner@lottery-prizes.info", recipient: "user@example.com", subject: "Congratulations! You've Won!", createdAt: "2025-12-27T10:15:33Z", folder: "inbox", scan: { result: "malicious", confidence: 0.989 } },
    { id: "7", sender: "jane.doe@client-partner.com", recipient: "user@example.com", subject: "Meeting Follow-up", createdAt: "2025-12-27T10:12:10Z", folder: "inbox", scan: { result: "safe", confidence: 1.0 } },
    { id: "8", sender: "admin@payroll-system.co", recipient: "user@example.com", subject: "Verify Your Payroll Information", createdAt: "2025-12-27T10:09:01Z", folder: "inbox", scan: { result: "malicious", confidence: 0.921 } },
    { id: "9", sender: "newsletter@tech-today.com", recipient: "user@example.com", subject: "This Week in AI", createdAt: "2025-12-27T10:05:47Z", folder: "inbox", scan: { result: "safe", confidence: 0.997 } },
    { id: "10", sender: "security-alert@microsoft-online.net", recipient: "user@example.com", subject: "Unusual sign-in activity", createdAt: "2025-12-27T10:02:21Z", folder: "inbox", scan: { result: "dangerous", confidence: 0.65 } },
    { id: "11", sender: "ceo@my-company.com", recipient: "user@example.com", subject: "Urgent: Wire Transfer Request", createdAt: "2025-12-27T09:58:14Z", folder: "inbox", scan: { result: "malicious", confidence: 0.884 } },
    { id: "12", sender: "no-reply@social-network.com", recipient: "user@example.com", subject: "You have a new friend request", createdAt: "2025-12-27T09:55:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.999 } },
    { id: "13", sender: "billing@utility-corp.com", recipient: "user@example.com", subject: "Monthly Bill Ready", createdAt: "2025-12-27T09:50:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.991 } },
    { id: "14", sender: "info@conference-organizer.org", recipient: "user@example.com", subject: "Registration Confirmation", createdAt: "2025-12-27T09:45:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.994 } },
    { id: "15", sender: "system@internal-it.net", recipient: "user@example.com", subject: "Password Reset Requested", createdAt: "2025-12-27T09:40:00Z", folder: "inbox", scan: { result: "dangerous", confidence: 0.452 } },
    { id: "16", sender: "alerts@crypto-exchange.io", recipient: "user@example.com", subject: "Significant Price Drop", createdAt: "2025-12-27T09:35:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.999 } },
    { id: "17", sender: "support@delivery-service.com", recipient: "user@example.com", subject: "Your Package is on the Way", createdAt: "2025-12-27T09:30:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.987 } },
    { id: "18", sender: "rewards@loyalty-program.com", recipient: "user@example.com", subject: "You have 5,000 pending points", createdAt: "2025-12-27T09:25:00Z", folder: "inbox", scan: { result: "dangerous", confidence: 0.621 } },
    { id: "19", sender: "team@project-management-tool.com", recipient: "user@example.com", subject: "New task assigned to you", createdAt: "2025-12-27T09:20:00Z", folder: "inbox", scan: { result: "safe", confidence: 0.998 } },
    { id: "20", sender: "updates@airline-booking.com", recipient: "user@example.com", subject: "Flight Update: Gate Change", createdAt: "2025-12-27T09:15:00Z", folder: "inbox", scan: { result: "safe", confidence: 1.0 } },
];

export const MOCK_THREATS: Threat[] = [
    { id: "threat-1", subject: "Action Required: Your Account is Locked", type: "Phishing", from: "support@verified-bank.com" },
    { id: "threat-2", subject: "Congratulations! You've Won!", type: "Malware Link", from: "winner@lottery-prizes.info" },
    { id: "threat-3", subject: "Verify Your Payroll Information", type: "Credential Theft", from: "admin@payroll-system.co" },
    { id: "threat-4", subject: "Urgent: Wire Transfer Request", type: "Business Email Compromise", from: "ceo@my-company.com" },
    { id: "threat-5", subject: "Password Reset Requested", type: "Account Takeover Attempt", from: "system@internal-it.net" },
];

export const MOCK_THREATS_BY_DAY = [
    { date: "Jan 07", threats: 15 },
    { date: "Jan 08", threats: 22 },
    { date: "Jan 09", threats: 18 },
    { date: "Jan 10", threats: 25 },
    { date: "Jan 11", threats: 30 },
    { date: "Jan 12", threats: 28 },
    { date: "Jan 13", threats: 42 },
];

export const MOCK_METRICS = {
    totalScanned: 24512,
    threatsBlocked: 86,
    cleanEmails: 24426,
    detectionAccuracy: 99.1,
};
