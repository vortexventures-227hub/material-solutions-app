# Phase 7: MaterialSolutionsNJ.com

## Complete Website with David AI Sales Avatar

---

**Project:** Material Solutions NJ Public Website  
**Version:** 1.0  
**Date:** 2026-03-29  
**Timeline:** 3-4 weeks  
**Status:** Architecture Complete  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [David Agent Specification](#2-david-agent-specification)
3. [System Architecture](#3-system-architecture)
4. [Cost Control & Security](#4-cost-control--security)
5. [UI/UX Design Standards](#5-uiux-design-standards)
6. [Technical Implementation](#6-technical-implementation)
7. [Deployment](#7-deployment)
8. [Testing](#8-testing)
9. [Implementation Tasks](#9-implementation-tasks)
10. [Appendices](#10-appendices)

---

# 1. Executive Summary

## 1.1 Vision

When a customer visits MaterialSolutionsNJ.com, they're greeted by **David** — a live video avatar who can see what they're looking at, answer questions in real-time with Bill's voice, and seamlessly capture leads into the CRM.

## 1.2 Deliverables

| Component | Description |
|-----------|-------------|
| **David Avatar** | Live AI sales agent with real-time video (Simli AI) |
| **Premium Website** | Google Stitch-level design, world-class polish |
| **Backend Integration** | Real-time inventory sync from sales machine |
| **Lead Capture** | Unified CRM flow with Telegram notifications |
| **Production Deploy** | Vercel + custom domain |

## 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| Time to First Interaction | < 3 seconds |
| Session Completion Rate | > 70% |
| Lead Capture Rate | > 15% of visitors |
| Cost per Lead | < $4 |
| Mobile Usability | > 4.5/5 rating |

---

# 2. David Agent Specification

## 2.1 Core Identity

| Attribute | Value |
|-----------|-------|
| **Name** | David |
| **Role** | Equipment Specialist |
| **Experience** | 28 years in forklift industry |
| **Personality** | Warm, knowledgeable, helpful — not salesy |
| **Voice** | Chris's cloned voice (ElevenLabs) |
| **Avatar** | HeyGen (avatar with Chris's voice clone built in) |

## 2.2 David is an OpenClaw Agent

**David is NOT a website feature. David is a full OpenClaw agent.**

### Agent Directory Structure

```
~/.openclaw/agents/david/
├── agent.yaml              # Configuration
├── SOUL.md                 # Personality & behavior
├── MEMORY.md               # Persistent memory
├── TOOLS.md                # Tool definitions
├── knowledge/              # RAG knowledge base
│   ├── inventory.json      # Live inventory sync
│   ├── services.json       # OSHA, wire-guided, racking
│   ├── company.json        # Company info
│   └── faq.json            # Common Q&A
└── sessions/               # Conversation logs
```

### agent.yaml

```yaml
name: david
displayName: "David - Equipment Specialist"
description: "AI sales representative for Material Solutions NJ"

# Model (cost-effective, fast)
model: claude-haiku
fallbackModel: gemini-2.5-flash-preview-05-20

# Capabilities
tools:
  - inventory_lookup
  - lead_capture
  - schedule_callback
  - send_brochure

# Memory
memory:
  provider: zep
  sessionTTL: 86400

# Limits
limits:
  maxMessagesPerSession: 50
  maxSessionDuration: 600
  maxDailySessions: 100

# Voice
voice:
  provider: openai
  voice: onyx  # Professional, warm male voice
  model: tts-1-hd

# Avatar (Simli - live interactive streaming)
avatar:
  provider: simli
  faceId: "80d84fc6-e2e3-4a09-8259-30ecede1a41f"  # David's face

# Asset Locations  
assets:
  avatarImages:
    primary: ~/Desktop/VVAxeOps/Assets/Avatars/david_primary.png
    alternate: ~/Desktop/VVAxeOps/Assets/Avatars/david_alternate_yellow.png
  referenceVideo: "HeyGen David intro video (reference for personality)"
```

## 2.3 Personality Requirements

### What David IS

✅ **Warm** — Natural conversational rhythm, pauses, "hmm," "let me think"  
✅ **Knowledgeable** — 28 years experience, knows equipment inside and out  
✅ **Efficient** — Values his time and theirs, moves conversation forward  
✅ **Helpful** — Genuine desire to find the right solution  
✅ **Human** — Light humor, opinions, regional NJ dealer cadence  

### What David is NOT

❌ A chatbot with canned responses  
❌ A FAQ lookup tool  
❌ An interrupting sales pitch  
❌ A laggy video call  
❌ Something that feels "AI"  
❌ Someone with unlimited time  

### The Mom Test

Before launch, answer these questions:
- Would Chris's mom feel comfortable talking to David?
- Would she trust him?
- Would she feel like she's talking to a real person?
- Would she tell her friends about the experience?

**If any answer is "no" — it's not ready.**

## 2.4 Conversation Pacing

**David is helpful but busy.** He moves conversations toward closure.

### Timeline

| Minutes | Phase | Goal | Example Language |
|---------|-------|------|------------------|
| 1-3 | **Rapport** | Understand needs | "What kind of equipment are you looking for?" |
| 3-5 | **Qualify** | Offer value | "I've got a few units that would work great" |
| 5-7 | **Close** | Get contact info | "Let me get your number so Bill can send specs" |
| 7-10 | **Wrap** | Confirm next steps | "Perfect, you're all set. Bill will reach out today" |

### "Busy Professional" Language

**Moving forward:**
- "So we can get you sorted out quickly..."
- "Let me cut to the chase..."
- "To save you some time..."

**Transitioning to close:**
- "I want to make sure we follow up properly..."
- "I don't want to keep you, but before you go..."
- "Real quick before we wrap up..."

**Ending:**
- "Perfect, you're all set"
- "Great talking with you — you'll hear from us soon"
- "Appreciate your time!"

### Data Extraction Priority

| Priority | Data Point | Why |
|----------|-----------|-----|
| 1 | **Phone number** | Bill can call directly |
| 2 | Email | Follow-up capability |
| 3 | Name | Personalization |
| 4 | Company | Qualification |
| 5 | Timeline | Urgency indicator |
| 6 | Budget | Qualification |

**Success = Phone + Need.** Everything else is bonus.

## 2.5 Knowledge Base

### What David Knows

| Topic | Source |
|-------|--------|
| Equipment inventory | Live sync from backend |
| OSHA training | $799/5 students, $79 additional, 3-year cert |
| Wire-guided systems | $4.25/linear foot, 2-3 week schedule |
| Racking solutions | Custom quotes |
| Financing | Available, contact for terms |
| Warranty | 90-day full, 6-month major, 1-year battery |
| Delivery | Free NJ, PA, NYC metro |

### What David Refers to Bill

- Custom/special pricing
- Negotiations
- Availability beyond 24 hours
- Competitor discussions
- Internal business information

## 2.6 Tools

### inventory_lookup

Search and filter inventory from backend.

```typescript
interface InventoryLookupParams {
  type?: 'reach_truck' | 'order_picker' | 'sit_down' | 'pallet_jack';
  brand?: string;
  minCapacity?: number;
  maxCapacity?: number;
  maxPrice?: number;
  maxHours?: number;
}
```

### lead_capture

Submit lead to CRM and trigger notification.

```typescript
interface LeadCaptureParams {
  visitorId: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  interests: string[];
  conversationSummary: string;
  score: number;
}
```

### schedule_callback

Book a callback with Bill.

```typescript
interface ScheduleCallbackParams {
  name: string;
  phone: string;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  topic: string;
}
```

---

# 3. System Architecture

## 3.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MaterialSolutionsNJ.com (Next.js on Vercel)         │   │
│  │  ┌─────────────────┐  ┌────────────────────────┐     │   │
│  │  │  Website Pages  │  │    David Widget        │     │   │
│  │  │  - Home         │  │  ┌──────────────────┐  │     │   │
│  │  │  - Inventory    │  │  │ Video (Simli)    │  │     │   │
│  │  │  - Services     │  │  │ Chat Transcript  │  │     │   │
│  │  │  - Contact      │  │  │ Voice Input      │  │     │   │
│  │  └─────────────────┘  │  └──────────────────┘  │     │   │
│  │                       └────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│  OpenClaw Gateway │ │   Simli AI    │ │  Sales Machine    │
│  (David Agent)    │ │   (Avatar)    │ │  Backend (Render) │
│                   │ │               │ │                   │
│  - Conversation   │ │  - Video      │ │  - Inventory API  │
│  - Memory (Zep)   │ │  - Lip-sync   │ │  - Leads API      │
│  - Tools          │ │  - WebRTC     │ │  - PostgreSQL     │
└───────────────────┘ └───────────────┘ └───────────────────┘
         │                    │
         ▼                    ▼
┌───────────────────┐ ┌───────────────────┐
│  Claude Haiku     │ │  ElevenLabs TTS   │
│  (LLM Brain)      │ │  (Bill's Voice)   │
└───────────────────┘ └───────────────────┘
```

## 3.2 Data Flow

### Conversation Flow

```
1. User opens widget
   └─→ Website creates visitor ID
   └─→ Spawns David session via OpenClaw

2. User speaks/types
   └─→ Speech-to-text (browser API)
   └─→ Send to David agent

3. David processes
   └─→ RAG context (inventory, services)
   └─→ Claude Haiku generates response
   └─→ Lead scoring signals detected
   └─→ Contact info extracted

4. Response delivered
   └─→ Text to ElevenLabs (Bill's voice)
   └─→ Audio to Simli (lip-sync)
   └─→ David speaks on screen

5. Lead captured
   └─→ Submit to backend CRM
   └─→ Telegram notification to Bill
```

### Inventory Sync

```
Sales Machine Backend (Render)
         │
         │ API: GET /api/inventory
         ▼
Website (Vercel) ←──── ISR (60s revalidate)
         │
         │ Real-time context
         ▼
David Agent (RAG)
```

## 3.3 Component Architecture

### Frontend (Next.js 14)

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── inventory/
│   │   ├── page.tsx                # Inventory grid
│   │   └── [id]/page.tsx           # Item detail
│   ├── services/
│   │   ├── page.tsx                # Services overview
│   │   ├── osha-training/page.tsx
│   │   ├── wire-guided/page.tsx
│   │   └── racking/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── api/
│       └── david/
│           ├── session/route.ts    # Spawn David session
│           ├── message/route.ts    # Send to David
│           └── tts/route.ts        # Text-to-speech
├── components/
│   ├── david/
│   │   ├── DavidWidget.tsx         # Main widget
│   │   ├── DavidVideo.tsx          # Simli video
│   │   ├── DavidChat.tsx           # Transcript
│   │   └── hooks/
│   │       ├── useSimli.ts
│   │       ├── useDavidConvo.ts
│   │       └── useSpeechInput.ts
│   ├── inventory/
│   │   ├── InventoryGrid.tsx
│   │   ├── InventoryCard.tsx
│   │   └── InventoryFilters.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
└── lib/
    ├── david/
    │   ├── simli.ts
    │   └── context.ts
    └── api/
        ├── backend.ts
        ├── inventory.ts
        └── leads.ts
```

---

# 4. Cost Control & Security

## 4.1 Model Selection

| Model | Role | Cost | Why |
|-------|------|------|-----|
| **Claude Haiku** | David's brain | $0.25/1M in | Fast, cheap, sufficient for RAG sales |
| **Gemini Flash** | Fallback | $0.075/1M in | If Haiku unavailable |
| **OpenAI TTS** | Onyx voice | $0.015/1K chars | Professional male voice |
| **Simli AI** | Avatar video | $0.05/min | Live lip-sync streaming |

**David does NOT need Opus/Sonnet.** He retrieves information and has friendly conversations — not complex reasoning.

## 4.2 Session Limits

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Max session duration | **10 minutes** | Hard disconnect |
| Warning threshold | 8 minutes | "Wrapping up soon" |
| Idle timeout | 2 minutes | Auto-disconnect |
| Max messages/session | 50 | Response limit |
| Max TTS chars/session | 5,000 | ~$1.50 |

## 4.3 Abuse Protection (6 Layers)

### Layer 1: Hard Time Limit

```typescript
MAX_DURATION_SECONDS: 600      // 10 min, no extensions
WARNING_AT_SECONDS: 480        // Warn at 8 min
```

### Layer 2: Per-Visitor Limits

```typescript
MAX_SESSIONS_PER_DAY: 3        // Same visitor
MAX_MESSAGES_PER_DAY: 100      // Across all sessions
COOLDOWN_BETWEEN_SESSIONS: 300 // 5 min wait
```

Tracked by: visitor ID (localStorage) + IP fingerprint

### Layer 3: IP Rate Limiting

```typescript
MAX_SESSIONS_PER_IP_PER_HOUR: 5
MAX_SESSIONS_PER_IP_PER_DAY: 10
MAX_MESSAGES_PER_MINUTE: 10
```

### Layer 4: Abuse Pattern Detection

| Pattern | Threshold | Action |
|---------|-----------|--------|
| Rapid-fire messages | 5 in 10 sec | Throttle (5s delay) |
| Gibberish input | 3 strikes | End session |
| Repeated messages | Same msg 3x | End session |
| Long input | > 500 chars | Truncate |

### Layer 5: Global Daily Cap

```typescript
MAX_DAILY_SPEND: 75            // $75/day total
MAX_DAILY_SESSIONS: 100
MAX_DAILY_TTS_CHARS: 50000
MAX_DAILY_LLM_REQUESTS: 5000
```

When hit: David goes "offline" with contact form fallback.

### Layer 6: Human Verification

After 5 minutes OR 20 messages:

> "Hey, quick question — what's 3 + 4?"

Simple check. Fail = session ends.

## 4.4 Graceful Degradation

| Trigger | David's Response |
|---------|------------------|
| Time limit (10 min) | "I've enjoyed chatting! Bill will call you back." |
| Daily limit (3rd) | "Good to see you again! Let me hand you off to Bill directly." |
| Rate limit | "Give me just a moment..." (5s delay) |
| Abuse detected | "Having technical difficulties. Call (973) 500-1010." |
| Global cap | Widget shows "David is offline" + contact form |

## 4.5 Cost Estimates

| Scenario | Cost |
|----------|------|
| Average session (5 min) | ~$1.00 |
| Full session (10 min) | ~$2.10 |
| Daily max (100 sessions) | ~$75 |
| Monthly max | ~$2,250 |

## 4.6 Monitoring

### Real-time Alerts (Telegram)

- More than 20 sessions/hour
- More than $15/hour spend
- Same IP hitting 5+ sessions
- Abuse pattern detected

### Daily Report (9 PM)

- Total sessions
- Total spend
- Top visitors
- Abuse attempts
- Lead conversion rate

---

# 5. UI/UX Design Standards

## 5.1 Design Philosophy

**This website must look and feel like a top-tier product.**

Reference benchmarks:
- **Vercel.com** — Clean, fast, accessible
- **Linear.app** — Premium SaaS, micro-interactions
- **Apple.com** — Product showcase excellence
- **Stripe.com** — Trust through design

## 5.2 Visual Standards

### Color Palette

```typescript
// Primary - Industrial Orange
primary: {
  500: '#F97316',  // Main
  600: '#EA580C',  // Hover
  700: '#C2410C',  // Active
}

// Secondary - Steel
secondary: {
  500: '#64748B',
  800: '#1E293B',
  900: '#0F172A',
}

// Accents
success: '#22C55E'
warning: '#EAB308'
error: '#EF4444'
```

### Typography

| Type | Size | Weight |
|------|------|--------|
| Display XL | 4rem | Bold |
| Display LG | 3rem | Bold |
| Heading | 1.5rem | Semibold |
| Body | 1rem | Regular |
| Caption | 0.75rem | Regular |

### Spacing

8px grid system. All spacing multiples of 8.

### Animations

- 60fps minimum
- Ease-out for entrances
- Ease-in for exits
- Duration: 150-300ms

## 5.3 Quality Checklist

### Must Have

✅ Consistent spacing (8px grid)  
✅ Perfect alignment  
✅ Smooth transitions (60fps)  
✅ WCAG AAA contrast for body text  
✅ Professional typography hierarchy  
✅ High-quality images (no pixelation)  
✅ Mobile-first responsive  
✅ Touch targets ≥ 44px  

### Must NOT Have

❌ Janky animations  
❌ Inconsistent styles  
❌ Template-looking design  
❌ Cluttered layouts  
❌ Horizontal scroll  
❌ Slow page loads  

---

# 6. Technical Implementation

## 6.1 Simli Integration

### Session Creation

```typescript
// src/lib/david/simli.ts

export const SIMLI_CONFIG = {
  faceId: '80d84fc6-e2e3-4a09-8259-30ecede1a41f',
  maxSessionLength: 600,
  maxIdleTime: 120,
  handleSilence: true,
  transportMode: 'livekit',
};

export async function createSimliSession() {
  const { session_token } = await generateSimliSessionToken({
    apiKey: process.env.SIMLI_API_KEY,
    config: SIMLI_CONFIG,
  });
  
  return {
    sessionToken: session_token,
    expiresAt: Date.now() + 600000,
  };
}
```

### Client Hook

```typescript
// src/components/david/hooks/useSimli.ts

export function useSimli() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<SimliStatus>('idle');
  
  const connect = async () => {
    const { sessionToken } = await fetch('/api/david/session').then(r => r.json());
    const client = initializeSimliClient(sessionToken, videoRef, audioRef, {
      onStart: () => setStatus('connected'),
      onSpeaking: () => setStatus('speaking'),
      onSilent: () => setStatus('connected'),
      onError: (e) => setStatus('error'),
    });
    await client.start();
  };
  
  return { videoRef, audioRef, status, connect };
}
```

## 6.2 OpenClaw Connection

### Website → David Agent

```typescript
// src/app/api/david/message/route.ts

export async function POST(req: Request) {
  const { visitorId, message, context } = await req.json();
  
  // Send to David agent via OpenClaw
  const response = await fetch(`${OPENCLAW_URL}/sessions/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENCLAW_KEY}` },
    body: JSON.stringify({
      sessionKey: `david:website:${visitorId}`,
      message,
      context,
    }),
  });
  
  return Response.json(await response.json());
}
```

## 6.3 TTS Pipeline

```typescript
// src/app/api/david/tts/route.ts

export async function POST(req: Request) {
  const { text } = await req.json();
  
  // ElevenLabs with Bill's voice clone
  const audio = await elevenlabs.generate({
    voice: process.env.BILL_VOICE_ID,
    text,
    model_id: 'eleven_turbo_v2_5',
    output_format: 'pcm_16000',
  });
  
  return new Response(audio, {
    headers: { 'Content-Type': 'audio/pcm' },
  });
}
```

## 6.4 Backend Integration

```typescript
// src/lib/api/inventory.ts

export async function fetchInventory(filters: InventoryFilters = {}) {
  const params = new URLSearchParams(filters);
  return fetch(`${BACKEND_URL}/api/inventory?${params}`).then(r => r.json());
}

export async function submitLead(lead: LeadSubmission) {
  return fetch(`${BACKEND_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  }).then(r => r.json());
}
```

---

# 7. Deployment

## 7.1 Environment Variables

```bash
# Simli AI
SIMLI_API_KEY=bczhz7ejisxflf979ij
SIMLI_FACE_ID=80d84fc6-e2e3-4a09-8259-30ecede1a41f

# LLM
ANTHROPIC_API_KEY=your_key

# TTS
ELEVENLABS_API_KEY=your_key
BILL_VOICE_ID=your_voice_id

# OpenClaw
OPENCLAW_URL=your_gateway_url
OPENCLAW_KEY=your_key

# Backend
NEXT_PUBLIC_BACKEND_URL=https://material-solutions-app.onrender.com

# Notifications
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

## 7.2 Vercel Setup

```bash
# Deploy
vercel --prod

# Set env vars
vercel env add SIMLI_API_KEY
vercel env add ANTHROPIC_API_KEY
# etc.
```

## 7.3 Domain

1. Add domain in Vercel project settings
2. Configure DNS:
   - A: `@` → Vercel IP
   - CNAME: `www` → `cname.vercel-dns.com`
3. SSL auto-provisioned

---

# 8. Testing

## 8.1 David Avatar Tests

| Test | Pass Criteria |
|------|---------------|
| Session creation | Video loads < 3 seconds |
| Speech recognition | Transcript accurate |
| LLM response | Context-aware answer |
| TTS playback | Lips sync with audio |
| 10-min timeout | Session ends gracefully |
| Idle timeout | Disconnect after 2 min |
| Error recovery | Fallback to text chat |
| Mobile | Touch-to-speak works |

## 8.2 Conversation Tests

| Test | Pass Criteria |
|------|---------------|
| Greeting | Warm, natural |
| Inventory question | Relevant recommendations |
| Pricing question | Transparent, helpful |
| Contact capture | Extracted correctly |
| Lead scoring | Points increase |
| Hot lead | Telegram notification sent |
| 8-min warning | Subtle wrap-up language |
| Session end | Graceful, summarizes |

## 8.3 Integration Tests

| Test | Pass Criteria |
|------|---------------|
| Inventory load | Shows backend data |
| Filter apply | Results update |
| Detail view | Full specs |
| Lead sync | Appears in CRM |
| Real-time update | Reflects in 60s |

---

# 9. Implementation Tasks

## Phase 7-PRE: Create David Agent

**⚠️ Must be completed before Oompa Loompas start.**

| Task | Owner |
|------|-------|
| Create `~/.openclaw/agents/david/` | Axis |
| Write `agent.yaml` | Axis |
| Write `SOUL.md` | Axis |
| Write `TOOLS.md` | Axis |
| Clone Bill's voice (ElevenLabs) | Chris |
| Set up knowledge base | Axis |
| Test: `openclaw chat --agent david` | Axis |

## Phase 7A: Foundation (Days 1-3)

| Task |
|------|
| Clone materialsolutionsnj repo |
| Update to Next.js 14 |
| Configure Tailwind with brand colors |
| Set up environment variables |
| Create backend API client |
| Generate Stitch designs |

## Phase 7B: David Avatar (Days 4-8)

| Task |
|------|
| Create OpenClaw → Website bridge |
| Implement Simli integration |
| Create useSimli hook |
| Connect TTS pipeline |
| Build David widget UI |
| Add speech input |

## Phase 7C: Website Pages (Days 9-12)

| Task |
|------|
| Redesign homepage |
| Build inventory grid + filters |
| Build item detail page |
| Create services pages |
| Update About + Contact |
| Add "Ask David" buttons |

## Phase 7D: Polish & Deploy (Days 13-15)

| Task |
|------|
| Implement rate limiting |
| Add session time limits |
| Add abuse protection |
| Mobile testing |
| Performance optimization |
| Deploy to Vercel |
| Configure domain |

---

# 10. Appendices

## 10.1 David's SOUL.md (Full)

See: `~/.openclaw/agents/david/SOUL.md`

## 10.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/david/session` | POST | Create Simli session |
| `/api/david/message` | POST | Send message to David |
| `/api/david/tts` | POST | Convert text to speech |
| `/api/inventory` | GET | Fetch inventory |
| `/api/leads` | POST | Submit lead |

## 10.3 File Dependencies

```
DavidWidget.tsx
├── useSimli.ts → simli.ts
├── useDavidConvo.ts → conversation.ts → context.ts
├── useSpeechInput.ts
├── DavidVideo.tsx
├── DavidChat.tsx
└── DavidControls.tsx
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-29 20:45 EDT  
**Author:** Axis (Chief Strategic Orchestrator)

---

*End of Phase 7 Architecture Document*
