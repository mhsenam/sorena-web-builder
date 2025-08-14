 **AI Site Builder**» 
# معماری کلّی

* **Frontend:** Next.js 14 (App Router) + React Server/Client Components + Tailwind CSS
* **Backend:** Route Handlers‌ خود Next.js (بدون سرور جدا)، استریم پاسخ مدل
* **AI Layer:** یک LLM (مثلاً OpenAI) برای تولید ساختار صفحه، کامپوننت‌ها و استایل؛ امکان سوییچ مدل‌ها
* **State & Cache:** Zustand یا React Query در کلاینت + KV (اختیاری برای history)
* **Export:** تولید فایل‌های پروژه در حافظه و خروجی ZIP (با `jszip`)
* **Hosting:** Vercel (Build سریع و رایگان برای MVP)
* **Telemetry:** Vercel Analytics + یک وبهوک خطا (Sentry اختیاری)

---

# تجربه کاربری (UX Flow)

1. کاربر یک جمله می‌نویسد: «یه صفحه برای کافه با منو، تماس، نقشه»
2. فرم آپشن‌ها: Framework (Vanilla/React/Next)، تم رنگی، فونت، Layout، زبان محتوا
3. زدن دکمه Generate → استریم پیش‌نمایش لایو (Skeleton + Progress)
4. بعد از کامل شدن:

   * دکمه‌های **Edit Sections** (تنظیم متن/عکس/رنگ‌ها)،
   * **Export ZIP**،
   * **Deploy to Vercel** (اختیاری).

---

# ساختار دایرکتوری (پیشنهادی)

```
/app
  /api
    /generate/route.ts        // تولید کد صفحه از Prompt
    /export/route.ts          // دریافت JSON ساختار و برگرداندن ZIP
  /preview
    page.tsx                  // UI پیش‌نمایش لایو
  page.tsx                    // Landing + فرم
  layout.tsx
/components
  PromptForm.tsx
  LivePreview.tsx
  SectionEditor.tsx
  ExportButtons.tsx
/lib
  ai.ts                       // فراخوانی مدل + استریم
  prompts.ts                  // قالب‌های پرامپت
  codegen.ts                  // قالب‌سازی فایل‌ها از JSON
  zip.ts                      // ساخت ZIP با jszip
  validation.ts               // zod schemas
/styles
  globals.css
```

---

# قرارداد داده (Data Contract)

## ورودی به AI

```ts
type BuildRequest = {
  intent: string;              // توضیح کاربر
  framework: "vanilla"|"react"|"next";
  theme: { primary: string; secondary?: string; font?: string; dark?: boolean };
  sections: Array<"hero"|"features"|"menu"|"gallery"|"pricing"|"contact"|"faq">;
  language: "fa"|"en";
  brand?: { name?: string; tone?: "formal"|"casual"|"playful" };
};
```

## خروجی از AI (میانی)

```ts
type SitePlan = {
  meta: { title: string; description: string; language: string };
  assets: { images: Array<{id:string; prompt?:string; url?:string}> };
  sections: Array<{
    id: string;
    type: string;                 // hero, features, ...
    props: Record<string, any>;   // متن‌ها، لیست‌ها، آدرس‌ها
  }>;
  style: { colors: Record<string,string>; font?: string };
};
```

## خروجی نهایی برای Export

```ts
type GeneratedFiles = {
  files: Array<{ path: string; content: string }>; // e.g. "index.html", "styles.css", ...
};
```

---

# پرامپت‌های هوشمند (Prompt Templates)

```ts
// /lib/prompts.ts
export const SYSTEM_PROMPT = `
You are a senior frontend architect that outputs strict JSON conforming to the given TypeScript types.
Generate a minimal, semantic, accessible site plan. Avoid inline styles. Prefer utility classes.
Return ONLY valid JSON.
`;

export const USER_PROMPT = (req: BuildRequest) => `
Build a SitePlan for this request:
${JSON.stringify(req, null, 2)}

Rules:
- language: ${req.language}
- sections must match requested types.
- text must be realistic and concise.
- for images, suggest alt texts and stable placeholders.
- keep brand tone: ${req.brand?.tone ?? "neutral"}.
`;
```

---

# فراخوانی مدل و استریم

```ts
// /lib/ai.ts
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateSitePlan(req: BuildRequest) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // یا مدل دلخواه
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT(req) }
    ],
    temperature: 0.7
  });

  const json = completion.choices[0].message?.content;
  if (!json) throw new Error("Empty AI response");
  return JSON.parse(json) as SitePlan;
}
```

> نکته: اگر می‌خوای **استریم UI** داشته باشی، می‌تونی اول یک پیام “draft plan” بگیری و با SSE در `Route Handler` بفرستی، بعد نسخه نهایی رو جایگزین کنی.

---

# Route: تولید طرح

```ts
// /app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSitePlan } from "@/lib/ai";
import { buildFilesFromPlan } from "@/lib/codegen";

const BuildSchema = z.object({
  intent: z.string().min(5),
  framework: z.enum(["vanilla","react","next"]),
  theme: z.object({ primary:z.string(), secondary:z.string().optional(), font:z.string().optional(), dark:z.boolean().optional() }),
  sections: z.array(z.enum(["hero","features","menu","gallery","pricing","contact","faq"])).min(1),
  language: z.enum(["fa","en"]),
  brand: z.object({ name:z.string().optional(), tone:z.enum(["formal","casual","playful"]).optional() }).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = BuildSchema.parse(body);

    const plan = await generateSitePlan(data);
    const files = buildFilesFromPlan(plan, data.framework);

    return NextResponse.json({ plan, files });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
```

---

# Codegen: تولید فایل‌ها از JSON

```ts
// /lib/codegen.ts
export function buildFilesFromPlan(plan: SitePlan, framework: BuildRequest["framework"]): GeneratedFiles {
  if (framework === "vanilla") {
    const html = renderHtml(plan);
    const css  = renderCss(plan);
    const js   = renderJs(plan);
    return { files: [
      { path: "index.html", content: html },
      { path: "styles.css", content: css },
      { path: "main.js", content: js },
    ]};
  }
  if (framework === "react") {
    // مثال ساده — می‌تونی برای هر section یک Component بسازی
    const pkg = basicPkgJson("react");
    return { files: [
      { path: "package.json", content: pkg },
      { path: "src/App.jsx", content: renderReactApp(plan) },
      { path: "src/main.jsx", content: `import React from 'react';import { createRoot } from 'react-dom/client';import App from './App';createRoot(document.getElementById('root')).render(<App/>);` },
      { path: "index.html", content: `<!doctype html><div id="root"></div>` },
    ]};
  }
  // next: scaffold ساده
  const pkg = basicPkgJson("next");
  return { files: [
    { path: "package.json", content: pkg },
    { path: "app/page.tsx", content: renderNextPage(plan) },
    { path: "app/layout.tsx", content: baseLayout(plan) },
    { path: "styles/globals.css", content: tailwindBase() },
    { path: "tailwind.config.ts", content: tailwindConfig(plan) },
  ]};
}
```

> توابع `renderHtml`, `renderReactApp`, `renderNextPage` متن‌های تمیز و semantic تولید می‌کنن؛ سعی کن کلاس‌های Tailwind رو از `plan.style.colors` و نوع سکشن‌ها بسازی.

---

# Route: خروجی ZIP

```ts
// /lib/zip.ts
import JSZip from "jszip";
export async function zipFiles(files: GeneratedFiles["files"]) {
  const zip = new JSZip();
  files.forEach(f => zip.file(f.path, f.content));
  return await zip.generateAsync({ type: "nodebuffer" });
}

// /app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { zipFiles } from "@/lib/zip";

export async function POST(req: NextRequest) {
  const { files } = await req.json();
  const buf = await zipFiles(files);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="site-${Date.now()}.zip"`
    }
  });
}
```

---

# کامپوننت‌های کلاینت

```tsx
// /components/PromptForm.tsx
"use client";
import { useState } from "react";

export default function PromptForm({ onResult }:{ onResult:(data:any)=>void }) {
  const [loading,setLoading] = useState(false);
  const [intent,setIntent] = useState("");
  const [framework,setFramework] = useState<"vanilla"|"react"|"next">("next");

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/generate", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        intent,
        framework,
        theme:{ primary:"#7c3aed", dark:false },
        sections:["hero","features","contact"],
        language:"fa",
        brand:{ tone:"casual" }
      })
    });
    const data = await res.json();
    setLoading(false);
    onResult(data);
  }

  return (
    <div className="space-y-3">
      <textarea className="w-full border p-3 rounded" rows={4} placeholder="مثلاً: سایت معرفی کافه با منو و تماس"
        value={intent} onChange={e=>setIntent(e.target.value)} />
      <div className="flex gap-3">
        <select className="border p-2 rounded" value={framework} onChange={e=>setFramework(e.target.value as any)}>
          <option value="next">Next.js</option>
          <option value="react">React</option>
          <option value="vanilla">HTML/CSS/JS</option>
        </select>
        <button onClick={submit} disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">
          {loading ? "در حال ساخت..." : "بساز"}
        </button>
      </div>
    </div>
  );
}
```

```tsx
// /components/LivePreview.tsx
"use client";
import { useState } from "react";

export default function LivePreview({ initial }: { initial?: any }) {
  const [data,setData] = useState<any>(initial);

  if (!data) return <div className="text-gray-500">پس از ساخت، پیش‌نمایش اینجا نمایش داده می‌شود.</div>;

  return (
    <div className="border rounded p-4 space-y-6">
      <h2 className="text-xl font-bold">{data.plan?.meta?.title}</h2>
      {data.plan?.sections?.map((s:any)=>(
        <section key={s.id} className="p-4 border rounded">
          <div className="text-sm opacity-70">{s.type}</div>
          {/* اینجا می‌تونی برای هر type یک رندر اختصاصی بسازی */}
          <pre className="text-xs overflow-auto">{JSON.stringify(s.props, null, 2)}</pre>
        </section>
      ))}
    </div>
  );
}
```

---

# صفحه اصلی

```tsx
// /app/page.tsx
import PromptForm from "@/components/PromptForm";
import LivePreview from "@/components/LivePreview";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">AI Site Builder</h1>
      <PromptForm onResult={(d)=>{ (window as any).__data = d; location.href="/preview"; }} />
      <p className="text-sm text-gray-500">پس از ساخت، به صفحه پیش‌نمایش هدایت می‌شوی.</p>
    </main>
  );
}
```

```tsx
// /app/preview/page.tsx
"use client";
import { useEffect, useState } from "react";
import LivePreview from "@/components/LivePreview";
import ExportButtons from "@/components/ExportButtons";

export default function Preview() {
  const [data,setData] = useState<any>(null);
  useEffect(()=>{ setData((window as any).__data); },[]);
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <LivePreview initial={data} />
      {data && <ExportButtons files={data.files} />}
    </main>
  );
}
```

```tsx
// /components/ExportButtons.tsx
"use client";
export default function ExportButtons({ files }:{ files:any[] }) {
  async function downloadZip() {
    const res = await fetch("/api/export",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ files })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "site.zip"; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="flex gap-3">
      <button onClick={downloadZip} className="px-4 py-2 rounded border">دانلود ZIP</button>
    </div>
  );
}
```

---

# امنیت، هزینه و مقیاس‌پذیری

* **Rate Limit:** در `route.ts` با `ip-based` یا کلید ناشناس، حداکثر ۳ درخواست/دقیقه
* **Input Sanitization:** zod و محدودیت طول متن (مثلاً ۱۰۰۰ کاراکتر)
* **Token Cost:** خروجی JSON فشرده، پرهیز از متن‌های طولانی غیرضروری
* **Caching:** اگر Prompt یکسان بود، Plan کش شود (KV یا edge cache)
* **Model Switch:** متغیر محیطی برای انتخاب مدل‌ (سریع/ارزان/کیفی)

---

# تست و کیفیت

* **Unit Test:** برای `codegen` (با ورودی SitePlan دترمینیستیک)
* **Contract Test:** اعتبارسنجی JSON خروجی مدل با `zod.safeParse`
* **Visual QA:** اسنپ‌شات HTML/CSS با `@testing-library/react` + `jest`