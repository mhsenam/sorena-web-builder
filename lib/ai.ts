import OpenAI from 'openai'
import { BuildRequest, SitePlan } from './validation'
import { SYSTEM_PROMPT, USER_PROMPT } from './prompts'

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!
})

export async function generateSitePlan(req: BuildRequest): Promise<SitePlan> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT(req) }
      ],
      temperature: 0.7
    })

    const json = completion.choices[0].message?.content
    if (!json) throw new Error('Empty AI response')
    
    return JSON.parse(json) as SitePlan
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate site plan')
  }
}