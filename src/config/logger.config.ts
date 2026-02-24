import winston from "winston";
import { getCorrelationId } from "../helpers/request.helper.ts";
import DailyRotateFile from "winston-daily-rotate-file";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...data }) => {
      const output = {
        timestamp,
        level,
        message,
        data,
        correlationId: getCorrelationId(),
      };
      return JSON.stringify(output);
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: "logs/-%DATE%-app.log",
      datePattern: "YYYY-MM-DD-HH",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // todo => add logic to save these logs in the mongo db
  ],
});

export default logger;
