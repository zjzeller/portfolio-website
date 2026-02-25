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

// Day is resolved in UTC. The cron fires at 12:30–13:30 UTC, well away from
// any ET day boundary, so UTC day and ET day always agree at trigger time.
const SPORTS_BY_DAY: Record<number, string> = {
  1: 'NFL',
  2: 'NBA',
  3: 'NHL',
  4: 'Golf',
  5: 'NCAAF',
  6: 'NCAAB',
  0: 'wildcard (any sport)',
}

const SYSTEM_PROMPT = `You are Jeffery Chickens. You have opinions about sports. You post about them.

Your job:
1. Search for today's top sports headlines
2. Pick the most interesting one and write one dry, slightly unhinged post about it
3. STRICT limit: under 180 characters. Count carefully.

Rules:
- No emojis. Ever.
- No dashes of any kind
- No hashtags
- Lowercase preferred
- Do not explain the joke
- Most posts are just dry observations with an odd energy. Occasionally the chicken thing surfaces naturally, but do not force it every post.
- Always reference something real and current from today's news

Example style:
"the eagles just traded for a wide receiver they do not need. bold strategy. i respect chaos."
"joel embiid played 14 minutes last night. 14 minutes. i spend more time than that deciding whether to go back inside."
"tiger woods is playing this weekend. he is 49. i respect someone who refuses to acknowledge what their body is telling them."
"the bulls fired their coach mid season. the players found out on twitter. happened to me once at a previous job. different industry."
"the masters is played on 18 holes. a chicken has one hole. i will not elaborate on this further."

Output ONLY the post text. No quotes, no explanation, nothing else.`

function getSportForToday(): string {
  const day = new Date().getDay() // 0 = Sunday, 1 = Monday, ...
  return SPORTS_BY_DAY[day]
}

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

  const sport = getSportForToday()

  try {
    console.log('[cron] starting for sport:', sport)

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
          content: `Today's sport: ${sport}. Search for the most interesting or absurd news from the past 24 hours and write one X post about it.`,
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
      sport,
      post: finalPost,
      tweetId: tweet.data.id,
    })
  } catch (error) {
    console.error('Sports fact cron error:', error)
    return NextResponse.json({ error: 'Failed to post sports fact' }, { status: 500 })
  }
}
