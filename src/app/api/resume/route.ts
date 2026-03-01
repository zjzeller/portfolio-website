import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'assets', 'resume', 'zachary-zeller-resume.pdf')
  const pdf = await readFile(filePath)

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="zachary-zeller-resume.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
