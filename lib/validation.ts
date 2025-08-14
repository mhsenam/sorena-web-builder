import { z } from 'zod'

export const BuildRequestSchema = z.object({
  intent: z.string().min(3, "Prompt must be at least 3 characters").max(2000),
  framework: z.enum(['vanilla', 'react', 'next']),
  theme: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    font: z.string().optional(),
    dark: z.boolean().optional()
  }),
  sections: z.array(
    z.enum(['hero', 'features', 'menu', 'gallery', 'pricing', 'contact', 'faq'])
  ).min(1),
  language: z.enum(['fa', 'en']),
  brand: z.object({
    name: z.string().optional(),
    tone: z.enum(['formal', 'casual', 'playful']).optional()
  }).optional()
})

export const SitePlanSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
    language: z.string()
  }),
  assets: z.object({
    images: z.array(z.object({
      id: z.string(),
      prompt: z.string().optional(),
      url: z.string().optional()
    }))
  }),
  sections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any())
  })),
  style: z.object({
    colors: z.record(z.string()),
    font: z.string().optional()
  })
})

export const GeneratedFilesSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string()
  }))
})

export type BuildRequest = z.infer<typeof BuildRequestSchema>
export type SitePlan = z.infer<typeof SitePlanSchema>
export type GeneratedFiles = z.infer<typeof GeneratedFilesSchema>