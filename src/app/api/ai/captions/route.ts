import { NextRequest, NextResponse } from 'next/server'

// TODO: Wire to Claude API (claude-sonnet-4-6) via Supabase Edge Function.
// See ARCHITECTURE-DECISIONS.md Decision 2 — AI Architecture (server-side language tasks).
//
// Implementation plan:
//   1. Accept platform, tone, and optional image description in POST body
//   2. Build a system prompt: "You are a professional photographer's social media assistant..."
//   3. Call claude-sonnet-4-6 with the photographer's brand tone + image context
//   4. Return 3 caption variants (Professional / Warm / Storytelling)
//
// For now this stub returns mock captions to unblock UI development.

const MOCK_CAPTIONS: Record<string, string[]> = {
  instagram: [
    "✨ Golden hour never disappoints. Every frame tells a story — this one tells a thousand. #GoldenHour #WeddingPhotography #CapturedMoments",
    "Love captured in light. 💛 Grateful for couples who trust me to preserve their most precious moments. Swipe to see more. #WeddingDay #PhotographyLove",
    "The light, the laughter, the love. Three things I chase every single shoot. #Photography #WeddingPhotographer #NaturalLight",
  ],
  facebook: [
    "What an incredible day with Emily & Ryan. The light was absolutely perfect and these two were naturals in front of the camera. Full gallery is ready — link in bio!",
    "Another beautiful wedding in the books! Thank you to this amazing couple for letting me be a part of your special day. Swipe through for some of my favorite moments.",
    "When the light cooperates and the couple is magic — you get days like this. So honored to capture these moments for families to treasure for generations.",
  ],
  pinterest: [
    "Golden Hour Wedding Photography Inspiration | Soft light portraits | Natural outdoor ceremony | Pacific Northwest wedding photographer",
    "Real Wedding Moments | Candid wedding photography ideas | Emotional ceremony details | Best wedding photographers 2026",
    "Wedding Photo Poses & Ideas | Romantic couple portraits | Natural lighting techniques | Outdoor wedding photography",
  ],
  tiktok: [
    "POV: You booked your dream photographer 🎬✨ Day-of gallery delivered in 48hrs. #WeddingPhotography #BehindTheLens #WeddingPOV",
    "The moment I knew this shot was special 📸 Natural light + genuine emotion = everything. #Photographer #GoldenHour #WeddingTikTok",
    "Editing this gallery at midnight because I can't stop 😭📷 #WeddingPhotographer #PhotoEditing #LateNightEdits",
  ],
}

const DEFAULT_CAPTIONS = [
  "Light. Emotion. Story. Every photo I take is a moment frozen in time — yours to keep forever.",
  "Documenting life's most beautiful chapters, one frame at a time.",
  "Because the best moments deserve to be remembered exactly as they felt.",
]

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { platform, imageDescription } = body as {
    platform?: string
    imageDescription?: string
  }

  // Suppress unused warning — will be used when wired to real Claude API
  void imageDescription

  // TODO: remove artificial delay once real API is wired
  await new Promise((resolve) => setTimeout(resolve, 800))

  const captions =
    (platform && MOCK_CAPTIONS[platform.toLowerCase()]) ?? DEFAULT_CAPTIONS

  return NextResponse.json({
    captions,
    tone_variants: {
      professional: captions[0] ?? DEFAULT_CAPTIONS[0],
      warm: captions[1] ?? DEFAULT_CAPTIONS[1],
      storytelling: captions[2] ?? DEFAULT_CAPTIONS[2],
    },
    source: 'mock', // TODO: remove this field when wired to real Claude API
  })
}
