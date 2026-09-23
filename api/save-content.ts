export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  // In serverless environments (read-only filesystem on Vercel), client data is persisted via localStorage / Export JSON
  return res.status(200).json({ 
    success: true, 
    message: "Content received and persisted in client session", 
    timestamp: new Date().toISOString() 
  });
}
