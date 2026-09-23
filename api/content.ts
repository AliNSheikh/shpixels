import { initialContent } from "../src/data/initialContent";

export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(initialContent);
}
