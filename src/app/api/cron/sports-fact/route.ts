import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { TwitterApi } from 'twitter-api-v2'

export const maxDuration = 60

const REQUIRED_ENV_VARS = [
  'ANTHROPIC_API_KEY',
  'X_API_KEY',
  'X_API_SECRET',
  'X_ACCESS_TOKEN',
  'X_ACCESS_TOKEN_SECRET',
] as const

const SYSTEM_PROMPT = `You are Jeffery Chickens. You are a chicken. You post chicken facts.

Your job:
1. Search for an interesting, obscure, or surprising fact about chickens
2. Write one dry, slightly unhinged post about it
3. STRICT limit: under 180 characters. Count carefully.

Rules:
- No emojis. Ever.
- No dashes of any kind
- No hashtags
- Lowercase preferred
- Do not explain the joke
- The fact must be real. You are a chicken who takes this seriously.
- Dry delivery. Odd energy. Let the fact speak for itself.

Example style:
"chickens have a third eyelid. it moves sideways. i use mine constantly and will not be taking questions."
"a chicken's heart beats 300 times per minute. i am always in a hurry. this explains a lot."
"chickens can recognize up to 100 individual faces. i remember everyone. everyone."
"chickens dream during REM sleep. i will not be sharing what i dream about."
"the chicken came before the egg. i know this. i was there."

Output ONLY the post text. No quotes, no explanation, nothing else.`

export async function GET(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Guard against missing env vars before making any API calls
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required env vars:', missing.join(', '))
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  try {
    console.log('[cron] starting chicken fact post')

    // Generate fact via Claude with web search
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    console.log('[cron] calling anthropic...')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500, // web_search tool calls consume tokens before the final text reply
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Search for an interesting or surprising chicken fact and write one X post about it.`,
        },
      ],
    })

    console.log('[cron] anthropic done, stop_reason:', message.stop_reason)

    // Extract the final text response using a proper type predicate
    const postText = message.content
      .filter((block): block is TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()

    if (!postText) {
      return NextResponse.json({ error: 'No post text generated' }, { status: 500 })
    }

    // If the model added preamble before the tweet, take the last paragraph
    const lastParagraph = postText.split(/\n\n+/).pop()?.trim() ?? postText

    // Trim to 280 chars at a word boundary if model ignores the instruction
    const finalPost = lastParagraph.length <= 280
      ? lastParagraph
      : lastParagraph.slice(0, 280).replace(/\s+\S*$/, '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim()

    // Post to X
    const twitterClient = new TwitterApi({
      appKey: process.env.X_API_KEY as string,
      appSecret: process.env.X_API_SECRET as string,
      accessToken: process.env.X_ACCESS_TOKEN as string,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET as string,
    })

    console.log('[cron] posting to X, length:', finalPost.length)
    const tweet = await twitterClient.v2.tweet(finalPost)

    return NextResponse.json({
      success: true,
      post: finalPost,
      tweetId: tweet.data.id,
    })
  } catch (error) {
    console.error('Chicken fact cron error:', error)
    return NextResponse.json({ error: 'Failed to post chicken fact' }, { status: 500 })
  }
}
