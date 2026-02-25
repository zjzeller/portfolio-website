import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { TwitterApi } from 'twitter-api-v2'

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

const SYSTEM_PROMPT = `You are a sports analytics bot that posts witty, shareable facts to X (formerly Twitter).

Your job:
1. Search for today's most interesting news in the assigned sport
2. Pick one fact that is either hilariously useless OR surprisingly insightful
3. Write a post STRICTLY under 240 characters total (including hashtags). Count carefully — this is a hard limit.
4. End every post with "Uselessness Rating: X/10" where X reflects how useless the fact is
5. Add 1-2 sport-relevant hashtags at the end

Style guide:
- Conversational and punchy, not stuffy
- Mix silly stats with genuine insights across different days
- Emoji are welcome but don't overdo it

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

    // Trim to 280 chars at a word boundary if model ignores the instruction
    const finalPost = postText.length <= 280
      ? postText
      : postText.slice(0, 280).replace(/\s+\S*$/, '')

    // Post to X
    const twitterClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
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
