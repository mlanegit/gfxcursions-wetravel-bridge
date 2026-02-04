import pino from "pino";

export const log = pino({
  level: process.env.LOG_LEVEL || "info",
  base: undefined, // cleaner logs on Vercel
  redact: {
    paths: ["req.headers.authorization", "*.apiKey", "*.token"],
    remove: true
  }
});
