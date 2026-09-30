import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8787;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6";

function textFromResponse(data){
  if (typeof data?.output_text === "string") return data.output_text;
  const chunks = [];
  for (const item of (data?.output || [])){
    for (const c of (item?.content || [])){
      if (typeof c?.text === "string") chunks.push(c.text);
    }
  }
  return chunks.join("\n");
}

async function callOpenAI(instructions, input, useWeb=false){
  if(!process.env.OPENAI_API_KEY){
    throw new Error("OPENAI_API_KEY is missing. Copy .env.example to .env and add your key.");
  }
  const body = {
    model: MODEL,
    instructions,
    input,
    temperature: 0.7
  };
  if(useWeb) body.tools = [{type:"web_search"}];

  const r = await fetch("https://api.openai.com/v1/responses", {
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  });
  const raw = await r.text();
  if(!r.ok) throw new Error(`OpenAI ${r.status}: ${raw}`);
  return JSON.parse(raw);
}

function parseJSON(text){
  const cleaned = text.replace(/^```json\s*/i,"").replace(/\s*```$/,"").trim();
  return JSON.parse(cleaned);
}

app.post("/api/trends", async (req,res)=>{
  try{
    const prompt = `Find five genuinely useful, current AI content opportunities for a creator publishing Instagram carousels and YouTube Shorts.
Focus on developments, tools, workflows, learning concepts, research, creative AI, agents and practical use cases.
Avoid politics, hype without substance, fabricated launches and duplicate topics.
Return JSON only:
{"topics":[{"cat":"TRENDS|LEARN|TUTORIAL|TOOLS|CREATIVE","title":"...","desc":"...","tags":["...","...","..."]}]}
The topics should be useful as of today and should be based on current web information.`;
    const data = await callOpenAI(
      "You are an AI content research editor. Be factual. Do not invent facts. Prefer primary/official sources when possible.",
      prompt,
      true
    );
    res.json(parseJSON(textFromResponse(data)));
  }catch(e){
    res.status(500).send(e.message);
  }
});

app.post("/api/generate", async (req,res)=>{
  try{
    const {action,topic,angle="",slides=8,language="en",format="post",style="editorial"} = req.body || {};
    if(action==="rewrite"){
      const data=await callOpenAI(
        "You are an expert social-content editor. Rewrite ideas without clickbait or invented claims. Return JSON only.",
        `Rewrite this AI content idea.
Topic: ${topic}
Instruction: ${angle}
Language: ${language}
Return: {"title":"...","description":"..."}`
      );
      return res.json(parseJSON(textFromResponse(data)));
    }

    const data=await callOpenAI(
      `You are the content engine behind a premium AI education publisher.
Create clear, save-worthy social content. Separate verified facts from interpretation.
Never invent product features, dates, benchmarks, research findings or company announcements.
Use concise editorial language. ${language==="te" ? "Use natural Telugu-English code-switching where useful." : ""}
Return valid JSON only.`,
      `Create a complete carousel package.
Topic: ${topic}
Angle: ${angle}
Slides: ${slides}
Format: ${format}
Visual style: ${style}

Return:
{
"title":"...",
"description":"...",
"category":"...",
"tags":["..."],
"slides":[
 {"heading":"...","body":"...","note":"...","visual":"detailed visual direction","motion":"detailed motion direction"}
],
"article":"HTML article body",
"caption":"Instagram caption",
"hashtags":["#...","#..."]
}
Slide 1 must be a strong hook. Final slide must have a clear takeaway.
Visual directions should describe diagrams, compositions, typography, references or generated imagery—not generic stock photos.`
    );
    res.json(parseJSON(textFromResponse(data)));
  }catch(e){
    res.status(500).send(e.message);
  }
});

app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT, ()=>console.log(`AI Carousel Engine running at http://localhost:${PORT}`));
