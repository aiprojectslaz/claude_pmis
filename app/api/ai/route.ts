// Stage 7: Full Anthropic SDK integration
// Stub returns a placeholder until Stage 7 wires live calls.
export async function POST(req: Request) {
  const { prompt, context } = await req.json() as { prompt: string; context?: string };

  // TODO Stage 7: replace stub with live Anthropic call
  // import Anthropic from "@anthropic-ai/sdk";
  // const client = new Anthropic();
  // const message = await client.messages.create({
  //   model: "claude-sonnet-4-20250514",
  //   max_tokens: 1000,
  //   messages: [{ role: "user", content: `${context ?? ""}${prompt}` }],
  // });
  // return Response.json({ text: message.content[0].text });

  const stubText = `[AI stub — Stage 7 not yet implemented]\n\nPrompt received: "${prompt}"\n\nContext length: ${context?.length ?? 0} chars.\n\nIn Stage 7 this will call claude-sonnet-4-20250514 with full PMBOK 7 project context.`;
  return Response.json({ text: stubText });
}
