import { EmailLog, Threat } from "./data";

export const MOCK_EMAIL_LOGS: EmailLog[] = [
    { id: "1", from: "marketing@example.com", subject: "Exclusive Offer Just For You!", datetime: "2025-12-27 10:30:15", status: "Clean", confidence: 99.8 },
    { id: "2", from: "support@verified-bank.com", subject: "Action Required: Your Account is Locked", datetime: "2025-12-27 10:28:45", status: "Malicious", confidence: 95.2 },
    { id: "3", from: "hr-department@company.net", subject: "Updated Company Policy", datetime: "2025-12-27 10:25:02", status: "Clean", confidence: 99.9 },
    { id: "4", from: "random-user@proton.me", subject: "FW: Urgent Invoice Payment", datetime: "2025-12-27 10:22:18", status: "Suspicious", confidence: 78.5 },
    { id: "5", from: "contact@your-cloud-storage.io", subject: "Your storage is almost full", datetime: "2025-12-27 10:19:55", status: "Clean", confidence: 99.5 },
    { id: "6", from: "winner@lottery-prizes.info", subject: "Congratulations! You've Won!", datetime: "2025-12-27 10:15:33", status: "Malicious", confidence: 98.9 },
    { id: "7", from: "jane.doe@client-partner.com", subject: "Meeting Follow-up", datetime: "2025-12-27 10:12:10", status: "Clean", confidence: 100.0 },
    { id: "8", from: "admin@payroll-system.co", subject: "Verify Your Payroll Information", datetime: "2025-12-27 10:09:01", status: "Malicious", confidence: 92.1 },
    { id: "9", from: "newsletter@tech-today.com", subject: "This Week in AI", datetime: "2025-12-27 10:05:47", status: "Clean", confidence: 99.7 },
    { id: "10", from: "security-alert@microsoft-online.net", subject: "Unusual sign-in activity", datetime: "2025-12-27 10:02:21", status: "Suspicious", confidence: 65.0 },
    { id: "11", from: "ceo@my-company.com", subject: "Urgent: Wire Transfer Request", datetime: "2025-12-27 09:58:14", status: "Malicious", confidence: 88.4 },
    { id: "12", from: "no-reply@social-network.com", subject: "You have a new friend request", datetime: "2025-12-27 09:55:00", status: "Clean", confidence: 99.9 },
    { id: "13", from: "billing@utility-corp.com", subject: "Monthly Bill Ready", datetime: "2025-12-27 09:50:00", status: "Clean", confidence: 99.1 },
    { id: "14", from: "info@conference-organizer.org", subject: "Registration Confirmation", datetime: "2025-12-27 09:45:00", status: "Clean", confidence: 99.4 },
    { id: "15", from: "system@internal-it.net", subject: "Password Reset Requested", datetime: "2025-12-27 09:40:00", status: "Suspicious", confidence: 45.2 },
    { id: "16", from: "alerts@crypto-exchange.io", subject: "Significant Price Drop", datetime: "2025-12-27 09:35:00", status: "Clean", confidence: 99.9 },
    { id: "17", from: "support@delivery-service.com", subject: "Your Package is on the Way", datetime: "2025-12-27 09:30:00", status: "Clean", confidence: 98.7 },
    { id: "18", from: "rewards@loyalty-program.com", subject: "You have 5,000 pending points", datetime: "2025-12-27 09:25:00", status: "Suspicious", confidence: 62.1 },
    { id: "19", from: "team@project-management-tool.com", subject: "New task assigned to you", datetime: "2025-12-27 09:20:00", status: "Clean", confidence: 99.8 },
    { id: "20", from: "updates@airline-booking.com", subject: "Flight Update: Gate Change", datetime: "2025-12-27 09:15:00", status: "Clean", confidence: 100.0 },
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
