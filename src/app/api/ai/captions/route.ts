import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock fallback — used when ANTHROPIC_API_KEY is not set (local dev)
const MOCK_CAPTIONS: Record<string, string[]> = {
  instagram: [
    "✨ Golden hour never disappoints. Every frame tells a story — this one tells a thousand. #GoldenHour #WeddingPhotography #CapturedMoments",
    "Love captured in light. 💛 Grateful for couples who trust me to preserve their most precious moments. Swipe to see more. #WeddingDay #PhotographyLove",
    "The light, the laughter, the love. Three things I chase every single shoot. #Photography #WeddingPhotographer #NaturalLight",
  ],
  facebook: [
    "What an incredible day with this amazing couple. The light was absolutely perfect and these two were naturals in front of the camera. Full gallery is ready — link in bio!",
    "Another beautiful wedding in the books! Thank you to this amazing couple for letting me be a part of your special day.",
    "When the light cooperates and the couple is magic — you get days like this.",
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
  const { platform, imageDescription, tone, photographerStyle } = body as {
    platform?: string
    imageDescription?: string
    tone?: string
    photographerStyle?: string
  }

  try {
    // Try to call the Supabase Edge Function (requires ANTHROPIC_API_KEY on Edge)
    const supabase = await createClient()
    const { data, error } = await supabase.functions.invoke('generate-captions', {
      body: { platform, imageDescription, tone, photographerStyle },
    })

    if (!error && data) {
      return NextResponse.json(data)
    }

    // Log but fall through to mock
    if (error) {
      console.warn('[captions] Edge function unavailable, using mock:', error.message)
    }
  } catch (err) {
    console.warn('[captions] Edge function call failed, using mock:', err)
  }

  // Mock fallback
  const captions =
    (platform && MOCK_CAPTIONS[platform.toLowerCase()]) ?? DEFAULT_CAPTIONS

  return NextResponse.json({
    captions,
    tone_variants: {
      professional: captions[0] ?? DEFAULT_CAPTIONS[0],
      warm: captions[1] ?? DEFAULT_CAPTIONS[1],
      storytelling: captions[2] ?? DEFAULT_CAPTIONS[2],
    },
    source: 'mock',
  })
}
