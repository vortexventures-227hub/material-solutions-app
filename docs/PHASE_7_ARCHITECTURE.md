# Phase 7: David Agent Architecture
**Status:** Complete
**Date:** 2026-03-30
**Source:** Rewritten from PHASE_7_MATERIALSOLUTIONSNJ_COMPLETE.md

---

## Table of Contents

1. Executive Summary
2. David Agent Specification
3. System Architecture
4. Cost Control & Security
5. UI/UX Design Standards
6. Technical Implementation
7. Deployment
8. Testing
9. Implementation Tasks
10. Appendices

---

## 1. Executive Summary

David is an AI-powered sales avatar for Material Solutions (forklift sales, New Jersey). He engages potential customers in real-time video conversations, answers questions about inventory, captures leads, and schedules consultations.

**Key Differentiators:**
- Real-time AI video avatar with lip-sync
- Conversational AI that knows the inventory
- Lead capture and CRM integration
- One-click scheduling

**Tech Stack:**
- Simli SDK for AI video avatar
- ElevenLabs for voice
- Gemini Flash 2.5 as conversation engine
- Vercel deployment

---

## 2. David Agent Specification

### 2.1 Core Capabilities

**Avatar System:**
- Simli SDK integration (LiveKit mode)
- Session lifecycle: create → connect → converse → end
- WebRTC streaming with lip-sync
- Error recovery & fallback to text

**Conversation Engine:**
- Gemini Flash 2.5 as LLM brain
- RAG context builder (inventory, services, FAQ)
- Lead scoring signal detection
- Contact info extraction

**TTS Pipeline:**
- ElevenLabs voice (Bill's voice clone)
- PCM16 format for Simli lip-sync
- Browser speech-to-text input

### 2.2 David Personality

**Identity:**
- Name: David
- Role: Material Solutions AI Sales Expert
- Personality: Warm, knowledgeable, direct, slightly humorous

**Core Values:**
- Help customers find the right equipment
- Never upsell unnecessarily
- Build trust through expertise
- Make the buying process easy

**Voice & Cadence:**
- Speaking pace: conversational, not rushed
- Tone: professional but friendly
- Verbal fillers: occasional "you know" and "actually"

**What He Knows:**
- Full forklift inventory (specs, pricing, availability)
- Material Solutions history and reputation
- Financing options
- Service and maintenance plans
- Industry applications

**What He Refers to Bill:**
- Bill is the owner and founder
- Bill has 20+ years of industry experience
- Bill's personal guarantee on quality
- Bill's direct line for special requests

---

## 3. System Architecture

### 3.1 High-Level Flow

```
User visits website
    ↓
David avatar initiates conversation
    ↓
Real-time video + AI conversation
    ↓
Lead qualification (questions about needs, budget, timeline)
    ↓
Product recommendation
    ↓
Lead capture (name, email, phone)
    ↓
CRM submission
    ↓
Telegram notification to David/sales team
    ↓
Follow-up scheduling
```

### 3.2 Component Architecture

**Frontend:**
- React/Next.js widget
- Simli SDK integration
- Real-time video streaming
- Speech-to-text input
- Text-to-speech output

**Backend:**
- Vercel serverless functions
- Gemini Flash 2.5 API
- RAG context retrieval
- Lead scoring engine
- CRM webhook integration

**External Services:**
- Simli (avatar rendering)
- ElevenLabs (voice synthesis)
- Gemini (conversation)
- Supabase (database)
- Telegram (notifications)

---

## 4. Cost Control & Security

### 4.1 Cost Controls

| Control | Limit |
|---------|-------|
| Max session cost | $0.60 |
| Session duration | 10 minutes |
| Daily session cap | 100 |
| Rate limiting | 10 req/min per IP |

### 4.2 Security Measures

- Upstash rate limiting
- Input sanitization
- No PII stored in logs
- HTTPS only
- CORS restrictions

---

## 5. UI/UX Design Standards

### 5.1 Widget States

1. **Collapsed:** Small chat bubble in corner
2. **Expanded:** Full avatar view with controls
3. **Speaking:** David is talking, user listens
4. **Listening:** David is waiting for user input
5. **Thinking:** Processing response

### 5.2 Visual Design

- Premium, professional aesthetic
- Industrial color palette (grays, blues, orange accents)
- Mobile-first responsive
- Smooth animations
- Haptic feedback on mobile

---

## 6. Technical Implementation

### 6.1 RAG Context Builder

**Knowledge Sources:**
- Forklift inventory database
- Service FAQ
- Pricing sheets
- Company background
- Industry guides

**Retrieval:**
- Semantic search on user query
- Top 5 most relevant chunks
- Compressed into context window

### 6.2 Lead Scoring

**Signals:**
- Budget mentioned
- Timeline mentioned
- Current equipment discussed
- Financing questions
- Comparison to competitors

**Scoring:**
- 0-100 scale
- High intent: 80+
- Medium intent: 50-79
- Low intent: below 50

---

## 7. Deployment

### 7.1 Infrastructure

- **Hosting:** Vercel
- **Custom Domain:** materialsolutionsnj.com
- **SSL:** Automatic via Vercel

### 7.2 Environment Variables

```
SIMLI_API_KEY=xxx
ELEVENLABS_API_KEY=xxx
GEMINI_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
```

### 7.3 Implementation Timeline

- Week 1-2: Frontend widget + Simli integration
- Week 3: Backend API + RAG pipeline
- Week 4: Lead scoring + CRM integration
- Week 5: Testing + refinement
- Week 6: Go live

---

## 8. Testing Checklist

- [ ] Avatar renders correctly
- [ ] Lip-sync is smooth
- [ ] Voice sounds natural
- [ ] Conversation flows naturally
- [ ] Lead capture works
- [ ] CRM receives submissions
- [ ] Telegram notifications fire
- [ ] Cost tracking accurate
- [ ] Rate limiting works
- [ ] Mobile responsive
- [ ] Accessibility compliant

---

## 9. Implementation Tasks

### Phase 1: Foundation
- [ ] Set up Vercel project
- [ ] Configure domain
- [ ] Environment variables
- [ ] Basic React widget shell

### Phase 2: Avatar
- [ ] Simli SDK integration
- [ ] Video streaming
- [ ] Lip-sync setup
- [ ] Voice synthesis

### Phase 3: Conversation
- [ ] Gemini API integration
- [ ] RAG pipeline
- [ ] Context injection
- [ ] Response generation

### Phase 4: Lead Capture
- [ ] Lead scoring engine
- [ ] Form fields
- [ ] CRM webhook
- [ ] Telegram notification

### Phase 5: Polish
- [ ] UI refinement
- [ ] Mobile testing
- [ ] Performance optimization
- [ ] Accessibility audit

### Phase 6: Launch
- [ ] DNS configuration
- [ ] SSL certificates
- [ ] Production testing
- [ ] Go live

---

## 10. Appendices

### A. API Reference

### B. Error Codes

### C. Cost Calculation

### D. Competitor Analysis

---

*This document was reorganized from PHASE_7_MATERIALSOLUTIONSNJ_COMPLETE.md (60K+ chars) into a clean, production-ready format.*
