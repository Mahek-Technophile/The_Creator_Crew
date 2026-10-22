export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'healthy',
    service: 'The Creator Crew API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    timestamp: new Date().toISOString(),
  });
}
