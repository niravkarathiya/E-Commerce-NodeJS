import path from 'path';
import fs from 'fs/promises'; // Use promise-based fs for better concurrency handling
import geoip from 'geoip-lite';

const logRequest = async (req: any, res: any, next: any) => {
    try {
        const geo = geoip.lookup(req.headers['x-real-ip'] || req.headers['x-forwarded-for']);
        const dateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'localhost';


        const logEntry = [
            `${geo?.city || ''}, ${geo?.country || ''}`,
            dateTime,
            ipAddress,
            req.method,
            req.originalUrl
        ];

        const logFilePath = path.join(__dirname, '../logs.csv');
        const headers = "Country,Date & Time,IP Address,Method,Route\n";
        const logData = logEntry.map(value => `"${value}"`).join(',') + '\n'; // Ensure CSV-safe entries

        // Check if the file exists, write headers if it doesn't
        try {
            await fs.access(logFilePath);
        } catch (error) {
            // Write headers if the file doesn't exist
            await fs.writeFile(logFilePath, headers, 'utf8');
        }

        // Append new log data
        await fs.appendFile(logFilePath, logData, 'utf8');
    } catch (error) {
        console.error("Error logging request", error);
    }

    next();
};

export default logRequest;
