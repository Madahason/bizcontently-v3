import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import { NextResponse } from "next/server";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, originalContent, targetWordCount } = await req.json();

    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert blog content writer. Your task is to elaborate and expand on the given section while maintaining the style, tone, and key points. Focus on adding valuable details, examples, and explanations that enhance the content's quality and depth.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("[ELABORATE_ERROR]", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to elaborate content",
      }),
      { status: 500 }
    );
  }
}
