import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TwitterApi } from 'twitter-api-v2'

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
3. Write a post under 260 characters total (including hashtags)
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

  const sport = getSportForToday()

  try {
    // Generate fact via Claude with web search
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Today's sport: ${sport}. Search for the most interesting or absurd news from the past 24 hours and write one X post about it.`,
        },
      ],
    })

    // Extract the final text response
    const postText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    if (!postText) {
      return NextResponse.json({ error: 'No post text generated' }, { status: 500 })
    }

    // Post to X
    const twitterClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
    })

    const tweet = await twitterClient.v2.tweet(postText)

    return NextResponse.json({
      success: true,
      sport,
      post: postText,
      tweetId: tweet.data.id,
    })
  } catch (error) {
    console.error('Sports fact cron error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to post sports fact' }, { status: 500 })
  }
}
