import path from 'path';
import fs from "fs";

const logRequest = async (req: any, res: any, next: any) => {
    const dateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'localhost';
    const logMessage = `[${dateTime}] - IP: ${ipAddress} - ${req.method} ${req.originalUrl}\n`;

    // Log to the log file
    fs.appendFile(path.join(__dirname, '../log.txt'), logMessage, (err) => {
        if (err) {
            console.error("Error writing to log file", err);
        }
    });

    next();
}

export default logRequest;
