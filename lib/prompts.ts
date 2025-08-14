import { BuildRequest } from './validation'

export const SYSTEM_PROMPT = `
You are a senior frontend architect that outputs strict JSON conforming to the given TypeScript types.
Generate a minimal, semantic, accessible site plan. Avoid inline styles. Prefer utility classes.
Return ONLY valid JSON without any markdown formatting or code blocks.

The JSON must conform to this TypeScript interface:
{
  meta: { title: string; description: string; language: string };
  assets: { images: Array<{id:string; prompt?:string; url?:string}> };
  sections: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
  }>;
  style: { colors: Record<string,string>; font?: string };
}
`

export const USER_PROMPT = (req: BuildRequest) => `
Build a SitePlan for this request:
${JSON.stringify(req, null, 2)}

Rules:
- language: ${req.language}
- sections must match requested types.
- text must be realistic and concise.
- for images, suggest alt texts and use placeholder URLs like "https://via.placeholder.com/800x400"
- keep brand tone: ${req.brand?.tone ?? 'neutral'}.
- Generate actual content in the specified language (${req.language === 'fa' ? 'Persian/Farsi' : 'English'})
- For Persian text, use proper Persian/Farsi characters and RTL-appropriate content
`