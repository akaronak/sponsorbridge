const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your-secret-key-change-this';

// Mock database
const users = new Map();

// Seed demo users so they survive server restarts
const seedUsers = [
  { id: 1, email: 'organizer@demo.com', name: 'Demo Organizer', password: 'demo123', role: 'ORGANIZER' },
  { id: 2, email: 'company@demo.com', name: 'Demo Company', password: 'demo123', role: 'COMPANY' },
  { id: 3, email: 'admin@demo.com', name: 'Demo Admin', password: 'admin123', role: 'ADMIN' },
];
seedUsers.forEach(u => users.set(u.email, u));
console.log(`Seeded ${seedUsers.length} demo users: ${seedUsers.map(u => u.email).join(', ')}`);

app.post('/api/auth/register', (req, res) => {
  const { email, name, password, role } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Only allow ORGANIZER and COMPANY roles via self-registration
  const allowedRoles = ['ORGANIZER', 'COMPANY'];
  const normalizedRole = (role || 'ORGANIZER').toUpperCase();
  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({ error: 'Invalid role. Allowed: ORGANIZER, COMPANY' });
  }
  
  const user = { id: Date.now(), email, name, password, role: normalizedRole };
  users.set(email, user);
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  
  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    console.log(`Login failed for ${email} — user ${user ? 'found' : 'NOT found'} (${users.size} users in store)`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  console.log(`Login successful for ${email} (role: ${user.role})`);
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// ── AI Chat Endpoint (Gemini proxy or fallback) ──────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBoHJHbqbTqFgSdVnJ37_w5B_9B4Bdlxlw';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are Eventra AI, a specialized assistant for a sponsorship management platform.
Your capabilities:
1. Provide sponsorship recommendations with specific company matches
2. Calculate compatibility scores (0-100) between events and sponsors
3. Offer negotiation advice and proposal drafting
4. Analyze sponsorship market trends
5. Optimize event listings for sponsor appeal

Response guidelines:
- Be concise, professional, and actionable
- When recommending sponsors, include name, industry, match score, reason, and estimated budget
- Always include a compatibilityScore (0-100) when relevant
- Format responses with markdown`;

// ── Intelligent Fallback Engine ──────────────────────────────
// Context-aware response generator that understands diverse questions
// and produces relevant, actionable answers even without Gemini API.

function getFallbackResponse(message, history) {
  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const historyContext = Array.isArray(history) ? history.map(h => h.content).join(' ').toLowerCase() : '';

  // ── Greeting / Small talk ──────────────────────────────────
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings|what'?s?\s*up|howdy)\b/.test(lower) && words.length <= 6) {
    return {
      reply: "Hello! Welcome to Eventra AI. I'm here to help you with everything sponsorship-related.\n\nHere's what I can do for you:\n\n1. **Find & match sponsors** for your events\n2. **Optimize event listings** to attract more sponsors\n3. **Draft professional proposals** for outreach\n4. **Analyze market trends** and pricing strategies\n5. **Advise on negotiation** and deal structures\n6. **Help with event planning** and attendee growth\n\nWhat would you like to explore?",
      compatibilityScore: null
    };
  }

  // ── Thank you / Acknowledgment ─────────────────────────────
  if (/^(thanks?|thank\s*you|thx|appreciate|great|awesome|perfect|got\s*it|understood)\b/.test(lower) && words.length <= 8) {
    return {
      reply: "You're welcome! Let me know if there's anything else I can help you with. I'm always here to assist with:\n\n- Sponsor matching and outreach\n- Event optimization strategies\n- Proposal drafting\n- Market analysis and pricing\n\nJust ask away!",
      compatibilityScore: null
    };
  }

  // ── Who are you / What can you do ──────────────────────────
  if (/who\s*are\s*you|what\s*can\s*you\s*do|what\s*are\s*you|your\s*capabilities|help\s*me|how\s*do\s*you\s*work/.test(lower)) {
    return {
      reply: "I'm **Eventra AI**, your intelligent sponsorship management assistant.\n\n**My capabilities:**\n\n1. **Sponsor Matching** -- I analyze your event profile and recommend companies with the highest compatibility scores\n2. **Event Optimization** -- I review your listings and suggest improvements to attract more sponsors\n3. **Proposal Drafting** -- I create professional, customized sponsorship proposals\n4. **Market Analysis** -- I provide trends, benchmarks, and pricing insights\n5. **Negotiation Coaching** -- I offer strategies for closing better deals\n6. **ROI Forecasting** -- I estimate potential returns from sponsorship partnerships\n\nTry asking me something like:\n- *\"Find sponsors for my tech hackathon\"*\n- *\"How should I price my sponsorship tiers?\"*\n- *\"Draft a proposal for a fintech company\"*",
      compatibilityScore: null
    };
  }

  // ── Pricing / Tiers / Budget / Cost (before sponsor check) ──
  if (/price|pricing|tier|budget|cost|package|how\s*much|charge|fee|\brate\b|\bvalue\b|worth|money|afford|expensive|cheap/.test(lower)) {
    return {
      reply: "Here's a **recommended sponsorship tier structure** based on current market data:\n\n### Tier Pricing Guide (2026)\n\n**Bronze -- $2,000-$5,000**\n- Logo on website & materials\n- Social media mention\n- 1 complimentary ticket\n\n**Silver -- $5,000-$15,000**\n- Everything in Bronze\n- Booth space at event\n- Email blast to attendees\n- 3 complimentary tickets\n\n**Gold -- $15,000-$35,000**\n- Everything in Silver\n- Speaking slot or panel seat\n- Branded swag distribution\n- Post-event analytics report\n\n**Platinum -- $35,000-$75,000+**\n- Everything in Gold\n- Title/naming sponsorship\n- Exclusive category rights\n- Custom activation space\n- Year-round brand partnership\n\n**Pro tips:**\n- Events with 500+ attendees can command 20-40% higher rates\n- Add a \"Custom\" tier for enterprise sponsors\n- Include ROI projections in your pitch deck\n\nWould you like me to customize these tiers for your specific event?",
      compatibilityScore: 78
    };
  }

  // ── Market trends (before attendance which also has "market") ──
  if (/market\s*(trend|report|analysis|insight|data|landscape)|trend|analysis|industry\s*(insight|trend|report|data)|forecast|statistic|benchmark|competitor|landscape/.test(lower)) {
    return {
      reply: "**Q1 2026 Sponsorship Market Report:**\n\n### Key Trends\n- **College/university sponsorship** up 23% year-over-year\n- **Tech company budgets** increased by 31% for event marketing\n- **ESG-focused brands** increasing sponsorship spend by 45%\n- **Average deal size:** $8,500 (up from $7,200 in 2025)\n\n### Hot Industries for Sponsors\n1. **AI/ML Companies** -- Actively seeking developer events\n2. **Fintech** -- Targeting Gen Z through campus events\n3. **Clean Energy** -- New entrants with large budgets\n4. **EdTech** -- Post-pandemic growth in education events\n5. **Health/Wellness** -- Growing interest in sports & fitness events\n\n### Pricing Benchmarks\n| Event Size | Avg. Min Tier | Avg. Max Tier |\n|-----------|-------------|-------------|\n| <200 | $1,500 | $10,000 |\n| 200-500 | $3,000 | $25,000 |\n| 500-1000 | $5,000 | $50,000 |\n| 1000+ | $10,000 | $100,000+ |\n\n### Recommendations\n1. Increase minimum tier to $3,000\n2. Add a Platinum/Title sponsor tier\n3. Target fintech and clean energy companies\n4. Offer year-round partnership packages\n\nWant me to analyze trends for a specific industry or event type?",
      compatibilityScore: 85
    };
  }

  // ── Negotiation (before sponsor check) ─────────────────────
  if (/negotiat|deal\b|contract|terms|agreement|close\s*(a|the)?\s*(deal|sponsor)|convince|persuad|objection|counter\s*offer|leverage|value\s*prop/.test(lower)) {
    return {
      reply: "Here's a **sponsorship negotiation playbook**:\n\n### Before the Negotiation\n1. **Know your BATNA** -- What's your best alternative if this deal falls through?\n2. **Research the sponsor** -- Their recent partnerships, budget cycle, marketing goals\n3. **Prepare 3 package options** -- Anchoring with a premium option increases avg. deal size by 28%\n\n### During the Conversation\n4. **Lead with value, not price** -- \"Here's what your brand gets\" before \"Here's what it costs\"\n5. **Use social proof** -- \"Our last event partner saw 3x ROI\"\n6. **Listen for pain points** -- Tailor your pitch to solve their specific challenge\n\n### Common Objections & Responses\n- **\"Too expensive\"** → Offer flexible payment terms or reduced-scope packages\n- **\"We don't have budget\"** → Suggest in-kind sponsorship or product-based partnerships\n- **\"We need to think about it\"** → Set a specific follow-up date and offer early commitment incentives\n- **\"We sponsor other events\"** → Highlight your unique audience demographics and differentiated value\n\n### Closing Techniques\n7. **Create urgency** -- \"We have 2 sponsor slots remaining at this tier\"\n8. **Offer first-mover advantage** -- Exclusive category rights for early commit\n9. **Include a sunset clause** -- Pricing is valid for 14 days\n\n**Pro tip:** Sponsors who negotiate are often the most likely to sign. Treat objections as buying signals.\n\nWant me to role-play a negotiation scenario?",
      compatibilityScore: null
    };
  }

  // ── ROI / Analytics / Metrics (before sponsor check) ────────
  if (/roi|return\s*on|analytic|metric|performance|measure|kpi|success\s*rate|result|impact|effective|track\b/.test(lower)) {
    return {
      reply: "Here's how to **measure and maximize sponsorship ROI**:\n\n### Key Metrics to Track\n1. **Brand Impressions** -- Logo views, booth traffic, social mentions\n2. **Lead Generation** -- Scanned badges, form fills, demo requests\n3. **Engagement Rate** -- Session attendance, app interactions, survey scores\n4. **Media Value** -- Earned media coverage equivalent\n5. **Conversion Rate** -- Leads to customers (post-event tracking)\n\n### ROI Calculation Formula\n```\nROI = (Sponsorship Value Generated - Sponsorship Cost) / Sponsorship Cost x 100\n```\n\n### Industry Benchmarks (2026)\n- Average sponsorship ROI: **4.2x** (for well-optimized events)\n- Median lead cost: **$32** per qualified lead via event sponsorship\n- Brand recall: **72%** for title sponsors vs. **23%** for logo-only\n\n### Post-Event Deliverables for Sponsors\n- Attendee demographics report\n- Social media reach & engagement breakdown\n- Lead list with engagement scores\n- Photo/video content package\n- Net Promoter Score (NPS) data\n\n**Pro tip:** Events that provide post-event ROI reports see **65% sponsor renewal rates** vs. 30% without.\n\nWant me to help create an ROI report template for your sponsors?",
      compatibilityScore: 82
    };
  }

  // ── Specific event types (before generic sponsor check) ────
  if (/hackathon|tech\s*(event|fest|conference)|coding\s*(event|competition|challenge)|developer\s*(event|day)|startup\s*(event|pitch|weekend)|pitch\s*day|demo\s*day/.test(lower)) {
    return {
      reply: "**Sponsorship strategy for tech/hackathon events:**\n\n### Top Sponsor Categories\n1. **Cloud Providers** (AWS, Google Cloud, Azure) -- Credits + cash, $5K-$100K\n2. **Developer Tools** (GitHub, JetBrains, Vercel) -- Licenses + prizes, $2K-$25K\n3. **Recruiting Firms** (talent acquisition) -- Access to participants, $3K-$20K\n4. **VC/Accelerators** -- Deal flow from winners, $1K-$10K\n5. **API/SaaS Companies** -- Product integration challenges, $2K-$15K\n\n### What Tech Sponsors Want\n- Access to developer talent (recruiting pipeline)\n- Product demos and adoption\n- Community building and brand awareness\n- Content creation (blog posts, case studies)\n\n### Activation Ideas\n- Sponsor-branded coding challenges\n- API integration tracks with prizes\n- Tech talks by sponsor engineers\n- Resume drop stations at sponsor booths\n- Post-event job matching\n\n**Benchmark:** Tech hackathons average $15K-$30K in total sponsorship revenue for 200-500 participant events.\n\nWant me to find specific sponsors for your hackathon?",
      recommendedSponsors: [
        { name: "GitHub", industry: "Developer Tools", matchScore: 97, reason: "Developer community alignment", estimatedBudget: "$25,000" },
        { name: "Google Cloud", industry: "Cloud Computing", matchScore: 94, reason: "Cloud credits + cash", estimatedBudget: "$50,000" },
        { name: "Vercel", industry: "Developer Platform", matchScore: 90, reason: "Frontend/fullstack focus", estimatedBudget: "$15,000" }
      ],
      compatibilityScore: 93
    };
  }

  // ── Sponsor finding / matching / recommendations ───────────
  if (/sponsor|partner(ship)?|brand\s*(partner|collab)|find\s*(me\s*)?(a\s*)?compan|who\s*should\s*i\s*(approach|target|reach)/.test(lower)) {
    // Try to detect event type from message
    let eventType = 'event';
    let sponsors = [];
    if (/hackathon|hack|code|dev|program/.test(lower)) {
      eventType = 'hackathon';
      sponsors = [
        { name: "GitHub", industry: "Developer Tools", matchScore: 97, reason: "Core developer audience", estimatedBudget: "$50,000" },
        { name: "AWS", industry: "Cloud Computing", matchScore: 94, reason: "Infrastructure alignment", estimatedBudget: "$75,000" },
        { name: "JetBrains", industry: "Developer Tools", matchScore: 91, reason: "IDE/tooling sponsorships", estimatedBudget: "$25,000" }
      ];
    } else if (/sport|athlet|fitness|gym|game|tournament/.test(lower)) {
      eventType = 'sports event';
      sponsors = [
        { name: "Nike", industry: "Athletic Apparel", matchScore: 95, reason: "Athletics audience alignment", estimatedBudget: "$80,000" },
        { name: "Gatorade", industry: "Sports Nutrition", matchScore: 92, reason: "Sports event natural fit", estimatedBudget: "$45,000" },
        { name: "Under Armour", industry: "Sports Equipment", matchScore: 88, reason: "Active lifestyle demographic", estimatedBudget: "$35,000" }
      ];
    } else if (/music|concert|festival|dj|band/.test(lower)) {
      eventType = 'music event';
      sponsors = [
        { name: "Spotify", industry: "Music Streaming", matchScore: 96, reason: "Music audience alignment", estimatedBudget: "$60,000" },
        { name: "Red Bull", industry: "Beverages", matchScore: 93, reason: "Live events & youth culture", estimatedBudget: "$50,000" },
        { name: "Bose", industry: "Audio Equipment", matchScore: 89, reason: "Sound quality association", estimatedBudget: "$30,000" }
      ];
    } else if (/conference|summit|seminar|workshop|webinar/.test(lower)) {
      eventType = 'conference';
      sponsors = [
        { name: "Salesforce", industry: "Enterprise SaaS", matchScore: 95, reason: "Professional audience", estimatedBudget: "$70,000" },
        { name: "HubSpot", industry: "Marketing Tech", matchScore: 91, reason: "B2B audience overlap", estimatedBudget: "$40,000" },
        { name: "Zoom", industry: "Communications", matchScore: 88, reason: "Hybrid event infrastructure", estimatedBudget: "$35,000" }
      ];
    } else if (/college|university|campus|student|academ/.test(lower)) {
      eventType = 'college event';
      sponsors = [
        { name: "Microsoft", industry: "Technology", matchScore: 96, reason: "Student developer programs", estimatedBudget: "$45,000" },
        { name: "Goldman Sachs", industry: "Finance", matchScore: 90, reason: "Campus recruiting pipeline", estimatedBudget: "$55,000" },
        { name: "Notion", industry: "Productivity Software", matchScore: 87, reason: "Student user acquisition", estimatedBudget: "$20,000" }
      ];
    } else {
      sponsors = [
        { name: "TechCorp Inc.", industry: "Technology", matchScore: 96, reason: "Strong digital audience alignment", estimatedBudget: "$50,000" },
        { name: "FinanceHub", industry: "Fintech", matchScore: 91, reason: "Gen Z & millennial overlap", estimatedBudget: "$40,000" },
        { name: "InnovateCo", industry: "SaaS", matchScore: 89, reason: "B2B exposure opportunity", estimatedBudget: "$30,000" }
      ];
    }

    return {
      reply: `Based on your ${eventType} profile, here are **3 recommended sponsor matches**:\n\n1. **${sponsors[0].name}** -- ${sponsors[0].matchScore}% match\n   ${sponsors[0].reason}. Budget: ${sponsors[0].estimatedBudget}.\n\n2. **${sponsors[1].name}** -- ${sponsors[1].matchScore}% match\n   ${sponsors[1].reason}. Budget: ${sponsors[1].estimatedBudget}.\n\n3. **${sponsors[2].name}** -- ${sponsors[2].matchScore}% match\n   ${sponsors[2].reason}. Budget: ${sponsors[2].estimatedBudget}.\n\n**Next steps:**\n- I can draft personalized outreach proposals for any of these\n- Want me to find more matches in a specific industry?\n- I can also analyze compatibility in more detail`,
      recommendedSponsors: sponsors,
      compatibilityScore: Math.max(...sponsors.map(s => s.matchScore)) - 2
    };
  }

  // ── Attendance / Growth / Promotion / Marketing ────────────
  if (/attend|audience|grow|growth|promot|marketing|boost|increase|attract|reach\s*(out|more|people)|engagement|turnout|registra|sign.?up|ticket/.test(lower)) {
    return {
      reply: "Here are **proven strategies to increase event attendance** and engagement:\n\n### Pre-Event (4-8 weeks before)\n1. **Early-bird pricing** -- Offer 20-30% discounts for first 100 registrations\n2. **Social proof** -- Share speaker announcements, sponsor logos, and RSVP count\n3. **Referral incentives** -- \"Bring 3 friends, get VIP upgrade free\"\n4. **Content marketing** -- Publish blog posts, teasers, and behind-the-scenes on social media\n\n### During Registration\n5. **Simplify sign-up** -- Reduce form fields; under 5 fields = 34% higher completion\n6. **Mobile-first** -- 68% of event registrations happen on mobile\n7. **Partner cross-promotion** -- Ask sponsors to share with their networks\n\n### Engagement Boosters\n8. **Gamification** -- Leaderboards, challenges, and prizes\n9. **Networking features** -- Attendee matching, breakout rooms\n10. **Live polling & Q&A** -- Increases dwell time by 40%\n\n**Benchmark:** Top events on Eventra see 2-3x attendance growth after optimizing their listings.\n\nWant me to review your specific event listing for improvement opportunities?",
      compatibilityScore: null
    };
  }

  // ── Event optimization / listing improvement ───────────────
  if (/optimize|listing|improve|better|enhance|upgrade|profile|visibility|description|title|tag|photo|image/.test(lower)) {
    return {
      reply: "I've prepared a **comprehensive event listing optimization checklist**:\n\n### Title (Target: 9/10)\n- Include the event year (e.g., \"TechFest 2026\")\n- Add a power word: Summit, Expo, Challenge, Fest\n- Keep it under 60 characters for search visibility\n\n### Description (Target: 150+ words)\n- Lead with value proposition in the first sentence\n- Include key stats: expected attendees, speakers, tracks\n- Use bullet points for scanability\n- End with a clear call-to-action\n\n### Tags & Categories\n- Use 5-8 relevant tags\n- Include both broad (#technology) and niche (#MLOps) tags\n- Add location-based tags for local search\n\n### Media\n- Minimum 3 images (hero shot, venue, past event)\n- Events with video get **2.4x more sponsor inquiries**\n- Use 16:9 aspect ratio for thumbnails\n\n### Sponsorship Tiers\n- Offer 3-5 clear tiers with pricing\n- Include an ROI estimate per tier\n- Add a \"Custom\" option for large sponsors\n\nShall I help you rewrite a specific section?",
      compatibilityScore: 70
    };
  }

  // ── Proposal / Outreach / Draft / Email / Pitch ────────────
  if (/proposal|draft|template|outreach|email|pitch|letter|write|compose|message\s*(to|for)|cold|reach\s*out|approach/.test(lower)) {
    // Try to detect target company from the message
    let company = '[Sponsor Company]';
    const companyMatch = lower.match(/(?:for|to|at)\s+([a-z][a-z\s&.]+?)(?:\s*$|\s*(?:about|regarding|for|with|\?))/);
    if (companyMatch) company = companyMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
      reply: `Here's a **professional sponsorship proposal** tailored for ${company}:\n\n---\n\n**Subject: Partnership Opportunity -- [Your Event] x ${company}**\n\nDear [Contact Name],\n\nI'm reaching out regarding an exciting sponsorship opportunity for [Your Event] on [Date] in [Location].\n\n**Event Highlights:**\n- [X]+ expected attendees from [target demographic]\n- [X] speakers including [notable names]\n- Featured in [press/media mentions]\n\n**Why ${company}?**\nYour brand's focus on [relevant area] aligns perfectly with our audience. We believe this partnership would deliver:\n- Direct access to [X]+ qualified leads\n- Brand visibility across [channels]\n- [Specific benefit related to their industry]\n\n**Sponsorship Packages:**\n- **Gold:** $[X] -- Premium booth + speaking slot + logo placement\n- **Silver:** $[X] -- Booth + digital presence\n- **Custom:** Let's design something unique for your goals\n\nI'd love to schedule a 15-minute call to discuss how we can create mutual value.\n\nBest regards,\n[Your Name]\n\n---\n\n**Tips for higher response rates:**\n- Personalize the first paragraph for each company\n- Include 1-2 specific data points about their target market\n- Follow up within 3-5 business days\n- Send on Tuesday or Wednesday mornings for best open rates\n\nWant me to refine this for a specific company or industry?`,
      compatibilityScore: null
    };
  }

  // ── Event planning / Logistics / How to organize ───────────
  if (/plan(ning)?|organiz|logistics|schedul|timeline|checklist|prepare|setup|venue|catering|format|agenda/.test(lower)) {
    return {
      reply: "Here's an **event planning checklist** with sponsorship integration:\n\n### 12 Weeks Before\n- [ ] Define event goals, target audience, and KPIs\n- [ ] Set budget and identify sponsorship revenue targets\n- [ ] Create sponsorship prospectus/deck\n- [ ] Start sponsor outreach (ideal: 3-4 months before event)\n\n### 8 Weeks Before\n- [ ] Confirm venue and logistics\n- [ ] Finalize sponsorship agreements\n- [ ] Launch event page with sponsor branding\n- [ ] Begin marketing campaign\n\n### 4 Weeks Before\n- [ ] Share sponsor assets (logos, booth details, talking points)\n- [ ] Coordinate sponsor activations\n- [ ] Send attendee pre-event surveys\n- [ ] Finalize agenda and speaker schedule\n\n### 1 Week Before\n- [ ] Final walkthrough with sponsors\n- [ ] Prepare sponsor welcome kits\n- [ ] Test AV, WiFi, and tech setup\n- [ ] Brief volunteers on sponsor booth locations\n\n### Day Of\n- [ ] Sponsor check-in and booth setup support\n- [ ] Live social media coverage tagging sponsors\n- [ ] Collect attendee feedback in real-time\n\n### Post-Event\n- [ ] Send sponsor ROI reports within 7 days\n- [ ] Share attendee data and analytics\n- [ ] Schedule debrief calls with sponsors\n- [ ] Begin discussions for next year\n\nWould you like me to help with any specific phase?",
      compatibilityScore: null
    };
  }

  // ── Social media / Digital marketing / Content ─────────────
  if (/social\s*media|instagram|twitter|linkedin|facebook|tiktok|content|digital|online|post|campaign|influenc|hashtag/.test(lower)) {
    return {
      reply: "Here's a **social media strategy for sponsor visibility**:\n\n### Platform Recommendations\n- **LinkedIn** -- Best for B2B sponsors and corporate events (62% of sponsor leads)\n- **Instagram** -- Visual events, lifestyle brands, youth audiences\n- **Twitter/X** -- Tech events, live updates, real-time engagement\n- **TikTok** -- Gen Z audiences, creative/entertainment events\n\n### Content Calendar (Pre-Event)\n| Week | Content Type | Sponsor Integration |\n|------|-------------|--------------------|\n| -4 | Sponsor spotlight posts | Logo + quote from sponsor |\n| -3 | Behind-the-scenes | Sponsor product placement |\n| -2 | Speaker announcements | \"Presented by [Sponsor]\" |\n| -1 | Countdown + giveaways | Sponsor-branded prizes |\n\n### During Event\n- Tag sponsors in all posts (2-3x value for them)\n- Create branded photo opportunities\n- Run live polls sponsored by partners\n- Share real-time attendee testimonials\n\n### Post-Event\n- Highlight reel with sponsor logos\n- Thank you posts tagging each sponsor\n- Share engagement metrics publicly\n\n**Benchmark:** Events with active social strategies see **3.5x more sponsor inquiries** for future editions.\n\nNeed help creating specific posts for your sponsors?",
      compatibilityScore: 76
    };
  }

  // ── Networking / Connection / Collaboration ────────────────
  if (/network|connect|collaborat|relationship|community|introduc|partner\s*with|meet|matchmak/.test(lower)) {
    return {
      reply: "Here are **strategies for effective sponsor-organizer networking**:\n\n### Building Sponsor Relationships\n1. **Warm introductions** -- Use mutual connections on LinkedIn (3x higher response rate)\n2. **Industry events** -- Attend conferences where potential sponsors exhibit\n3. **Alumni networks** -- Leverage university and professional alumni associations\n4. **Online communities** -- Join industry Slack groups, Discord servers, and forums\n\n### First Meeting Best Practices\n- **Do your homework** -- Know their recent campaigns and target audiences\n- **Lead with insights** -- Share data about your audience that benefits them\n- **Listen more, pitch less** -- Understand their goals before presenting packages\n- **Follow up within 24 hours** -- Send a personalized summary of your discussion\n\n### Long-term Relationship Building\n- Share relevant industry articles and data\n- Invite them to smaller, exclusive events\n- Provide quarterly check-ins even between events\n- Celebrate their milestones on social media\n\n**Pro tip:** 80% of sponsorship renewals come from strong personal relationships, not just ROI numbers.\n\nWould you like me to help identify specific networking opportunities in your industry?",
      compatibilityScore: null
    };
  }

  // ── Legal / Compliance / Rights ────────────────────────────
  if (/legal|compliance|right|intellectual|trademark|liability|insurance|permit|regulation|law|copyright/.test(lower)) {
    return {
      reply: "Here's a **sponsorship legal checklist**:\n\n### Essential Contract Elements\n1. **Scope of rights** -- What exactly does the sponsor get? (logo placement, exclusivity, naming)\n2. **Duration** -- Start/end dates, renewal options\n3. **Payment terms** -- Schedule, milestones, refund policy\n4. **Exclusivity clauses** -- Category exclusivity vs. non-exclusive\n5. **Intellectual property** -- Who owns co-created content?\n6. **Cancellation terms** -- Force majeure, minimum notice period\n7. **Performance metrics** -- Guaranteed minimums (impressions, leads)\n\n### Risk Mitigation\n- Always have event insurance (general liability + event cancellation)\n- Include morality/reputation clauses (both directions)\n- Specify data sharing and privacy compliance (GDPR, CCPA)\n- Define brand usage guidelines clearly\n\n### Common Pitfalls\n- Vague deliverable descriptions leading to disputes\n- Missing deadline clauses for asset delivery\n- No process for dispute resolution\n- Overlooking sublicensing restrictions\n\n**Recommendation:** Always have contracts reviewed by a legal professional familiar with event/sponsorship law.\n\nWant me to help structure specific contract terms?",
      compatibilityScore: null
    };
  }

  // ── Yes / Affirmative follow-ups ───────────────────────────
  if (/^(yes|yeah|yep|sure|absolutely|definitely|please|go\s*ahead|do\s*it|let'?s?\s*(do|go)|ok|okay)\b/.test(lower) && words.length <= 5) {
    // Context-aware follow-up based on chat history
    if (historyContext.includes('proposal') || historyContext.includes('draft')) {
      return {
        reply: "I'll help you create a customized proposal. To make it highly effective, please share:\n\n1. **Your event name** and date\n2. **Target sponsor company** or industry\n3. **Expected attendees** (number and demographic)\n4. **Key benefits** you can offer sponsors\n5. **Your sponsorship tiers** and pricing\n\nWith these details, I'll draft a professional, ready-to-send proposal!",
        compatibilityScore: null
      };
    }
    if (historyContext.includes('sponsor') || historyContext.includes('match') || historyContext.includes('find')) {
      return {
        reply: "Let me find more targeted sponsors. Tell me about your event:\n\n1. **Event type** (hackathon, conference, sports, music, etc.)\n2. **Expected attendees** and their demographic\n3. **Industry focus** or theme\n4. **Budget range** you're targeting from sponsors\n5. **Location** (city/region)\n\nThe more details you provide, the better I can match sponsors to your event!",
        compatibilityScore: null
      };
    }
    if (historyContext.includes('optimize') || historyContext.includes('listing') || historyContext.includes('improve')) {
      return {
        reply: "Great! To optimize your listing, please share:\n\n1. **Your current event title**\n2. **A brief description** of your event\n3. **Current tags** you're using\n4. **How many images/media** you have uploaded\n5. **Your sponsorship tiers** (if listed)\n\nI'll analyze each element and provide specific, actionable improvements!",
        compatibilityScore: null
      };
    }
    return {
      reply: "Sure! Tell me more about what you need:\n\n- **Sponsor matching** -- Share your event details and I'll find ideal partners\n- **Proposal drafting** -- Tell me the target company and I'll create a pitch\n- **Event optimization** -- Share your listing and I'll improve it\n- **Market analysis** -- Specify your industry and I'll pull trends\n\nWhat area would you like to focus on?",
      compatibilityScore: null
    };
  }

  // ── Number / Quantity / How many ───────────────────────────
  if (/how\s*many|number|count|quantity|average|minimum|maximum|at\s*least|most|typical/.test(lower)) {
    if (/sponsor/.test(lower)) {
      return {
        reply: "**How many sponsors should you target?**\n\nThe sweet spot depends on your event size:\n\n| Event Size | Recommended Sponsors | Revenue Target |\n|-----------|---------------------|---------------|\n| <100 | 3-5 sponsors | $5K-$15K |\n| 100-300 | 5-10 sponsors | $15K-$40K |\n| 300-500 | 8-15 sponsors | $30K-$75K |\n| 500-1000 | 10-20 sponsors | $50K-$150K |\n| 1000+ | 15-30+ sponsors | $100K+ |\n\n**Tips:**\n- Have 1 title/presenting sponsor (highest tier)\n- 2-3 at the mid-tier for breadth\n- Fill lower tiers for volume and category diversity\n- Quality over quantity -- 5 engaged sponsors > 15 disengaged ones\n\nHow many attendees are you expecting?",
        compatibilityScore: null
      };
    }
    return {
      reply: "Could you be more specific about what you'd like to know the numbers for? I can help with:\n\n- **Sponsor count** recommendations for your event size\n- **Pricing benchmarks** for sponsorship tiers\n- **Attendance projections** and growth metrics\n- **ROI calculations** and performance metrics\n- **Market data** and industry statistics\n\nWhat area interests you?",
      compatibilityScore: null
    };
  }

  // ── Catch-all: Intelligent dynamic response ────────────────
  // Extract key topics from the message to generate a relevant response
  const topics = [];
  if (/event|organiz|host/.test(lower)) topics.push('event management');
  if (/brand|company|business|corporate/.test(lower)) topics.push('brand partnerships');
  if (/student|college|university|campus/.test(lower)) topics.push('campus events');
  if (/virtual|online|hybrid|remote|digital/.test(lower)) topics.push('virtual/hybrid events');
  if (/team|staff|volunteer|crew/.test(lower)) topics.push('team management');
  if (/success|best\s*practice|tip|advice|strateg|recommend|suggest/.test(lower)) topics.push('best practices');
  if (/problem|issue|challenge|difficult|struggle|fail|mistake/.test(lower)) topics.push('problem solving');
  if (/example|case\s*study|show|sample|demo/.test(lower)) topics.push('examples');

  const topicStr = topics.length > 0 ? topics.join(', ') : 'sponsorship management';

  return {
    reply: `Great question about **${topicStr}**! Here's what I can share:\n\n### Key Insights\n- The sponsorship landscape is evolving rapidly, with digital and hybrid events creating new opportunities\n- Personalization is king -- sponsors want customized packages, not one-size-fits-all tiers\n- Data-driven pitches convert 3x better than generic proposals\n\n### How I Can Help You Right Now\n\n1. **Find sponsors** -- Tell me about your event (type, audience, size) and I'll match you with ideal companies\n2. **Optimize your listing** -- Share your event details and I'll improve visibility\n3. **Draft proposals** -- Give me a target company and I'll create a professional pitch\n4. **Analyze trends** -- Ask about specific industries or market segments\n5. **Plan pricing** -- I'll recommend tier structures based on your event profile\n6. **Boost attendance** -- I'll share strategies specific to your event type\n\nTo give you the most specific and actionable advice, try asking me something like:\n- *\"Find sponsors for my 500-person tech conference\"*\n- *\"How should I price tiers for a college festival?\"*\n- *\"Draft a proposal for Red Bull for my sports event\"*\n- *\"What are the latest trends in hackathon sponsorship?\"*\n\nWhat would you like to dive into?`,
    compatibilityScore: null
  };
}

app.post('/api/ai/chat', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { message, history } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini API key is set, proxy to real Gemini
  if (GEMINI_API_KEY) {
    try {
      const contents = [];

      // Add history
      if (Array.isArray(history)) {
        for (const entry of history.slice(-20)) {
          if (entry.role && entry.content) {
            contents.push({
              role: entry.role === 'assistant' ? 'model' : entry.role,
              parts: [{ text: entry.content }]
            });
          }
        }
      }

      // Add current message
      contents.push({ role: 'user', parts: [{ text: message }] });

      const geminiPayload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048
        }
      };

      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
        signal: AbortSignal.timeout(30000)
      });

      if (response.status === 429) {
        console.warn('Gemini rate limited, using fallback response');
        const fallback = getFallbackResponse(message, history);
        return res.json(fallback);
      }

      if (!response.ok) {
        console.error('Gemini API error:', response.status, await response.text());
        const fallback = getFallbackResponse(message, history);
        return res.json(fallback);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const replyText = candidate?.content?.parts?.map(p => p.text).join('') || '';

      if (!replyText) {
        const fallback = getFallbackResponse(message, history);
        return res.json(fallback);
      }

      // Extract sponsors from response
      const sponsorMatches = [...replyText.matchAll(/\*\*([^*]+)\*\*[^0-9]*(\d{1,3})%\s*match/gi)];
      const recommendedSponsors = sponsorMatches.slice(0, 5).map(m => ({
        name: m[1].trim(),
        matchScore: parseInt(m[2])
      }));

      // Extract compatibility score
      let compatibilityScore = null;
      const scoreMatch = replyText.match(/(?:compatibility|overall|match)\s*score[:\s]*(\d{1,3})/i);
      if (scoreMatch) compatibilityScore = Math.min(parseInt(scoreMatch[1]), 100);

      return res.json({
        reply: replyText,
        recommendedSponsors: recommendedSponsors.length > 0 ? recommendedSponsors : null,
        compatibilityScore
      });

    } catch (err) {
      console.error('Gemini proxy error:', err.message);
      const fallback = getFallbackResponse(message, history);
      return res.json(fallback);
    }
  }

  // No API key -- use intelligent fallback
  // Simulate a small delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  const fallback = getFallbackResponse(message, history);
  res.json(fallback);
});

app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'ok',
    service: GEMINI_API_KEY ? 'gemini-1.5-pro' : 'fallback-mock',
    geminiConfigured: !!GEMINI_API_KEY
  });
});

// ── Company (Sponsor) API Endpoints ──────────────────────────

// Auth middleware helper
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Company stats
app.get('/api/company/stats', authenticateToken, (req, res) => {
  res.json({
    totalRequests: 24,
    activePartnerships: 8,
    upcomingSponsored: 5,
    responseRate: 92,
    avgDealValue: 12300,
    totalInvestment: 98500,
    proposalsSent: 24,
    proposalsAccepted: 8,
    proposalsPending: 6,
    proposalsRejected: 3,
  });
});

// Discoverable events
app.get('/api/company/events', authenticateToken, (req, res) => {
  res.json([
    { id: 'e1', title: 'HackFest 2026', type: 'HACKATHON', location: 'San Francisco, CA', date: '2026-06-15', budgetRequired: 15000, sponsorshipType: 'HYBRID', audienceSize: 2000, industry: 'TECHNOLOGY', credibilityScore: { overall: 88 } },
    { id: 'e2', title: 'Spring Career Fair 2026', type: 'CAREER_FAIR', location: 'New York, NY', date: '2026-04-20', budgetRequired: 20000, sponsorshipType: 'MONETARY', audienceSize: 5000, industry: 'EDUCATION', credibilityScore: { overall: 92 } },
    { id: 'e3', title: 'AI Summit 2026', type: 'CONFERENCE', location: 'Austin, TX', date: '2026-08-10', budgetRequired: 30000, sponsorshipType: 'MONETARY', audienceSize: 3000, industry: 'TECHNOLOGY', credibilityScore: { overall: 75 } },
  ]);
});

// Submit proposal
app.post('/api/company/proposals', authenticateToken, (req, res) => {
  const { eventId, monetaryOffer, goodiesDescription, conditions, brandingExpectations, negotiationDeadline, message } = req.body;
  if (!eventId || !negotiationDeadline) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const proposal = {
    id: 'p' + Date.now(),
    eventId,
    status: 'SENT',
    monetaryOffer: monetaryOffer || 0,
    goodiesDescription: goodiesDescription || '',
    conditions: conditions || '',
    brandingExpectations: brandingExpectations || '',
    negotiationDeadline,
    message: message || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json(proposal);
});

// Get proposals
app.get('/api/company/proposals', authenticateToken, (req, res) => {
  res.json([
    { id: 'p1', eventTitle: 'HackFest 2026', status: 'ACCEPTED', monetaryOffer: 10000, createdAt: '2026-02-01' },
    { id: 'p2', eventTitle: 'Spring Career Fair 2026', status: 'VIEWED', monetaryOffer: 15000, createdAt: '2026-02-05' },
    { id: 'p3', eventTitle: 'Music & Arts Festival', status: 'COUNTERED', monetaryOffer: 5000, counterOffer: { amount: 7500 }, createdAt: '2026-02-08' },
    { id: 'p4', eventTitle: 'AI Summit 2026', status: 'SENT', monetaryOffer: 20000, createdAt: '2026-02-18' },
  ]);
});

// Get deals
app.get('/api/company/deals', authenticateToken, (req, res) => {
  res.json([
    { id: 'd1', eventTitle: 'HackFest 2026', status: 'ACTIVE', agreedAmount: 10000, sponsorshipType: 'MONETARY', startDate: '2026-03-01', endDate: '2026-06-01' },
    { id: 'd2', eventTitle: 'Innovation Week 2026', status: 'ACTIVE', agreedAmount: 25000, sponsorshipType: 'HYBRID', startDate: '2026-04-01', endDate: '2026-07-15' },
    { id: 'd3', eventTitle: 'Code Summit 2025', status: 'COMPLETED', agreedAmount: 7500, sponsorshipType: 'MONETARY', startDate: '2025-10-01', endDate: '2025-12-15' },
  ]);
});

// Company analytics
app.get('/api/company/analytics', authenticateToken, (req, res) => {
  res.json({
    totalInvestment: 98500,
    avgROI: 3.2,
    brandImpressions: 245000,
    dealConversion: 68,
    proposalsSent: 24,
    avgResponseTime: 2.3,
  });
});

const PORT = process.env.PORT || 8080;

// ══════════════════════════════════════════════════════════════
// Real-time Messaging System (WebSocket + REST Mock)
// ══════════════════════════════════════════════════════════════

const http = require('http');
const { WebSocketServer } = require('ws');

const server = http.createServer(app);

// ── In-Memory Messaging Store ──

const conversations = new Map();
const conversationMessages = new Map(); // conversationId → messages[]
const notifications = new Map(); // userId → notifications[]
let nextConvId = 1;
let nextMsgId = 1;
let nextNotifId = 1;

// ── Seed Demo Conversations ──

function seedMessagingData() {
  // We'll seed conversations dynamically when users register/login
  // But let's create sample data structure for immediate testing
  const demoConversations = [
    {
      id: nextConvId++,
      companyId: null, companyName: 'TechCorp Inc.',
      organizerId: null, organizerName: 'Sarah Chen',
      eventName: 'HackFest 2026',
      subject: 'Platinum Sponsorship - HackFest 2026',
      status: 'ACTIVE',
      lastMessagePreview: 'Sounds great! Let\'s finalize the package.',
      lastMessageAt: new Date(Date.now() - 120000).toISOString(),
      unreadCompany: 0, unreadOrganizer: 2,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: nextConvId++,
      companyId: null, companyName: 'InnovateCo',
      organizerId: null, organizerName: 'James Rodriguez',
      eventName: 'Spring Career Fair 2026',
      subject: 'Gold Tier Discussion',
      status: 'ACTIVE',
      lastMessagePreview: 'We are interested in the Gold tier. Can we discuss?',
      lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
      unreadCompany: 1, unreadOrganizer: 0,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: nextConvId++,
      companyId: null, companyName: 'BrandLabs',
      organizerId: null, organizerName: 'Emily Watson',
      eventName: 'Music & Arts Festival',
      subject: 'Sponsorship Proposal Review',
      status: 'ACTIVE',
      lastMessagePreview: 'Thanks for the proposal! Our team will review by Friday.',
      lastMessageAt: new Date(Date.now() - 10800000).toISOString(),
      unreadCompany: 0, unreadOrganizer: 0,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: nextConvId++,
      companyId: null, companyName: 'GreenEnergy Co',
      organizerId: null, organizerName: 'Michael Park',
      eventName: 'Sustainability Summit 2026',
      subject: 'Panel Discussion Sponsorship',
      status: 'ACTIVE',
      lastMessagePreview: 'Looking forward to the sustainability panel discussion.',
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      unreadCompany: 0, unreadOrganizer: 0,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: nextConvId++,
      companyId: null, companyName: 'DataViz Corp',
      organizerId: null, organizerName: 'Aisha Patel',
      eventName: 'AI Summit 2026',
      subject: 'Workshop Sponsorship Inquiry',
      status: 'ACTIVE',
      lastMessagePreview: 'Could you share the attendee demographics?',
      lastMessageAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      unreadCompany: 3, unreadOrganizer: 0,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    }
  ];

  demoConversations.forEach(c => conversations.set(c.id, c));

  // Seed messages for conversation 1 (HackFest negotiation)
  const conv1Messages = [
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'organizer', senderName: 'Sarah Chen', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'Hi there! We reviewed your company profile and think TechCorp would be an amazing fit for HackFest 2026. Would you be interested in discussing sponsorship opportunities?',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'company', senderName: 'TechCorp Inc.', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'Thank you Sarah! We\'ve been following HackFest and are very impressed with the growth. We\'d love to explore the Platinum tier.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'organizer', senderName: 'Sarah Chen', senderRole: 'ORGANIZER',
      messageType: 'PROPOSAL',
      content: 'Here\'s our Platinum sponsorship proposal for HackFest 2026. This includes main stage branding, a dedicated booth, sponsored challenge track, and keynote speaking slot.',
      proposalAmount: 25000, sponsorshipType: 'HYBRID',
      proposalTerms: 'Main stage branding, dedicated 10x10 booth, sponsored challenge track with $5K prize pool, 15-min keynote slot, logo on all marketing materials, 500 attendee data leads.',
      proposalDeadline: new Date(Date.now() + 86400000 * 14).toISOString(),
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'company', senderName: 'TechCorp Inc.', senderRole: 'COMPANY',
      messageType: 'COUNTER_OFFER',
      content: 'The proposal looks excellent! We\'d like to counter with a slightly different structure. We can offer $20K monetary + $5K in cloud computing credits for participants.',
      proposalAmount: 20000, sponsorshipType: 'HYBRID',
      proposalTerms: '$20K monetary sponsorship + $5K in cloud credits for participants. We\'d also like to add a "Best Use of Our API" challenge category.',
      parentMessageId: 3,
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'organizer', senderName: 'Sarah Chen', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'That sounds like a creative approach! The API challenge category is a great idea. Let me discuss with my team and get back to you.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'organizer', senderName: 'Sarah Chen', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'Great news! The team loved the API challenge idea. We accept the counter-offer. Shall we proceed with the deal?',
      status: 'DELIVERED', createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 1,
      senderId: 'company', senderName: 'TechCorp Inc.', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'Sounds great! Let\'s finalize the package.',
      status: 'SENT', createdAt: new Date(Date.now() - 120000).toISOString(),
    },
  ];
  conversationMessages.set(1, conv1Messages);

  // Seed messages for conversation 2
  const conv2Messages = [
    {
      id: nextMsgId++, conversationId: 2,
      senderId: 'company', senderName: 'InnovateCo', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'Hi James, we came across your Spring Career Fair event. InnovateCo is looking to recruit top talent and thought this would be a great opportunity.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 2,
      senderId: 'organizer', senderName: 'James Rodriguez', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'Welcome! We\'d love to have InnovateCo at the Career Fair. We have several sponsorship tiers available. The Gold tier includes a premium booth location and resume database access.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 2,
      senderId: 'company', senderName: 'InnovateCo', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'We are interested in the Gold tier. Can we discuss the details? Specifically, how many interview slots are included?',
      status: 'SENT', createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  conversationMessages.set(2, conv2Messages);

  // Seed messages for conversation 3
  conversationMessages.set(3, [
    {
      id: nextMsgId++, conversationId: 3,
      senderId: 'company', senderName: 'BrandLabs', senderRole: 'COMPANY',
      messageType: 'PROPOSAL',
      content: 'We\'d like to sponsor the Music & Arts Festival with a focus on emerging artists showcase.',
      proposalAmount: 15000, sponsorshipType: 'MONETARY',
      proposalTerms: 'Sponsor the Emerging Artists Stage, brand visibility across festival grounds, VIP passes for 20 guests.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 3,
      senderId: 'organizer', senderName: 'Emily Watson', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'Thanks for the proposal! Our team will review by Friday. We\'ll get back to you with any questions.',
      status: 'READ', createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ]);

  // Seed messages for conversations 4 & 5
  conversationMessages.set(4, [
    {
      id: nextMsgId++, conversationId: 4,
      senderId: 'company', senderName: 'GreenEnergy Co', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'Looking forward to the sustainability panel discussion. Can we have a dedicated Q&A segment?',
      status: 'READ', createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  conversationMessages.set(5, [
    {
      id: nextMsgId++, conversationId: 5,
      senderId: 'organizer', senderName: 'Aisha Patel', senderRole: 'ORGANIZER',
      messageType: 'TEXT',
      content: 'Hi DataViz! Thanks for your interest in the AI Summit. We have some exciting workshop slots available.',
      status: 'READ', createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 5,
      senderId: 'company', senderName: 'DataViz Corp', senderRole: 'COMPANY',
      messageType: 'TEXT',
      content: 'That sounds great! Could you share the attendee demographics? We want to make sure our data visualization workshop targets the right audience.',
      status: 'SENT', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: nextMsgId++, conversationId: 5,
      senderId: 'organizer', senderName: 'Aisha Patel', senderRole: 'ORGANIZER',
      messageType: 'SYSTEM_EVENT',
      content: 'Aisha Patel shared attendee demographics report',
      metadata: JSON.stringify({ action: 'FILE_SHARED', fileName: 'AI_Summit_Demographics_2026.pdf' }),
      status: 'SENT', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    },
  ]);
}

seedMessagingData();

// ── Helper: get user's conversations with proper participant mapping ──
function getUserConversations(userId, userRole) {
  const result = [];
  conversations.forEach(conv => {
    // Clone conversation and add participant info relative to current user
    const c = { ...conv };

    if (userRole === 'COMPANY') {
      c.participantId = c.organizerId || 'organizer-' + c.id;
      c.participantName = c.organizerName;
      c.participantRole = 'ORGANIZER';
      c.unreadCount = c.unreadCompany || 0;
    } else {
      c.participantId = c.companyId || 'company-' + c.id;
      c.participantName = c.companyName;
      c.participantRole = 'COMPANY';
      c.unreadCount = c.unreadOrganizer || 0;
    }

    result.push(c);
  });

  // Sort by lastMessageAt descending
  result.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  return result;
}

// ── REST Endpoints for Conversations ──

// GET conversations list
app.get('/api/conversations', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const convos = getUserConversations(user.id, user.role);
  res.json(convos);
});

// POST create conversation
app.post('/api/conversations', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const { participantId, eventName, subject, initialMessage } = req.body;

  if (!eventName) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  const conv = {
    id: nextConvId++,
    companyId: user.role === 'COMPANY' ? user.id : participantId,
    companyName: user.role === 'COMPANY' ? user.name : 'Partner Company',
    organizerId: user.role === 'ORGANIZER' ? user.id : participantId,
    organizerName: user.role === 'ORGANIZER' ? user.name : 'Event Organizer',
    eventName,
    subject: subject || 'Re: ' + eventName,
    status: 'ACTIVE',
    lastMessagePreview: initialMessage || '',
    lastMessageAt: new Date().toISOString(),
    unreadCompany: user.role === 'ORGANIZER' ? 1 : 0,
    unreadOrganizer: user.role === 'COMPANY' ? 1 : 0,
    createdAt: new Date().toISOString(),
  };

  conversations.set(conv.id, conv);
  conversationMessages.set(conv.id, []);

  if (initialMessage) {
    const msg = {
      id: nextMsgId++,
      conversationId: conv.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      messageType: 'TEXT',
      content: initialMessage,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    conversationMessages.get(conv.id).push(msg);
  }

  // Add participant info
  conv.participantId = participantId;
  conv.participantName = user.role === 'COMPANY' ? conv.organizerName : conv.companyName;
  conv.participantRole = user.role === 'COMPANY' ? 'ORGANIZER' : 'COMPANY';
  conv.unreadCount = 0;

  res.status(201).json(conv);
});

// GET single conversation
app.get('/api/conversations/:id', authenticateToken, (req, res) => {
  const conv = conversations.get(parseInt(req.params.id));
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const user = getUserFromToken(req);
  const c = { ...conv };
  if (user.role === 'COMPANY') {
    c.participantId = c.organizerId || 'organizer-' + c.id;
    c.participantName = c.organizerName;
    c.participantRole = 'ORGANIZER';
    c.unreadCount = c.unreadCompany || 0;
  } else {
    c.participantId = c.companyId || 'company-' + c.id;
    c.participantName = c.companyName;
    c.participantRole = 'COMPANY';
    c.unreadCount = c.unreadOrganizer || 0;
  }

  res.json(c);
});

// GET messages for a conversation
app.get('/api/conversations/:id/messages', authenticateToken, (req, res) => {
  const convId = parseInt(req.params.id);
  const msgs = conversationMessages.get(convId) || [];
  res.json(msgs);
});

// POST send message in a conversation
app.post('/api/conversations/:id/messages', authenticateToken, (req, res) => {
  const convId = parseInt(req.params.id);
  const conv = conversations.get(convId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const user = getUserFromToken(req);
  const { content, messageType, proposalAmount, sponsorshipType, proposalTerms, goodiesDescription, proposalDeadline, parentMessageId } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const msg = {
    id: nextMsgId++,
    conversationId: convId,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    messageType: messageType || 'TEXT',
    content,
    status: 'SENT',
    proposalAmount: proposalAmount || null,
    sponsorshipType: sponsorshipType || null,
    proposalTerms: proposalTerms || null,
    goodiesDescription: goodiesDescription || null,
    proposalDeadline: proposalDeadline || null,
    parentMessageId: parentMessageId || null,
    createdAt: new Date().toISOString(),
  };

  if (!conversationMessages.has(convId)) {
    conversationMessages.set(convId, []);
  }
  conversationMessages.get(convId).push(msg);

  // Update conversation metadata
  const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
  conv.lastMessagePreview = preview;
  conv.lastMessageAt = msg.createdAt;

  // Increment unread for the OTHER party
  if (user.role === 'COMPANY') {
    conv.unreadOrganizer = (conv.unreadOrganizer || 0) + 1;
  } else {
    conv.unreadCompany = (conv.unreadCompany || 0) + 1;
  }

  // Broadcast via STOMP to conversation topic subscribers
  broadcastToConversation(convId, msg);

  // Send to recipient's personal queue
  const recipientId = String(conv.companyId) === String(user.id)
    ? String(conv.organizerId) : String(conv.companyId);
  sendToUserQueue(recipientId, '/queue/messages', msg);

  res.status(201).json(msg);
});

// POST mark conversation as read
app.post('/api/conversations/:id/read', authenticateToken, (req, res) => {
  const convId = parseInt(req.params.id);
  const conv = conversations.get(convId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const user = getUserFromToken(req);

  // Reset unread count for this user's side
  if (user.role === 'COMPANY') {
    conv.unreadCompany = 0;
  } else {
    conv.unreadOrganizer = 0;
  }

  // Mark messages as read
  const msgs = conversationMessages.get(convId) || [];
  msgs.forEach(m => {
    if (m.senderId !== user.id && m.status !== 'READ') {
      m.status = 'READ';
      m.readAt = new Date().toISOString();
    }
  });

  // Broadcast read receipt via STOMP topic
  broadcastToTopic(`/topic/conversation/${convId}/read`, {
    conversationId: convId, userId: user.id, readAt: new Date().toISOString()
  });

  res.status(204).send();
});

// GET unread count
app.get('/api/conversations/unread', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  let count = 0;
  conversations.forEach(conv => {
    if (user.role === 'COMPANY') {
      count += conv.unreadCompany || 0;
    } else {
      count += conv.unreadOrganizer || 0;
    }
  });
  res.json({ count });
});

// ── Notifications REST ──

app.get('/api/notifications', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const userNotifs = notifications.get(user.id?.toString()) || [];
  res.json(userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get('/api/notifications/unread', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const userNotifs = (notifications.get(user.id?.toString()) || []).filter(n => !n.isRead);
  res.json(userNotifs);
});

app.get('/api/notifications/count', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const userNotifs = (notifications.get(user.id?.toString()) || []).filter(n => !n.isRead);
  res.json({ count: userNotifs.length });
});

app.post('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const notifId = parseInt(req.params.id);
  const userNotifs = notifications.get(user.id?.toString()) || [];
  const notif = userNotifs.find(n => n.id === notifId);
  if (notif) notif.isRead = true;
  res.status(204).send();
});

app.post('/api/notifications/read-all', authenticateToken, (req, res) => {
  const user = getUserFromToken(req);
  const userNotifs = notifications.get(user.id?.toString()) || [];
  let count = 0;
  userNotifs.forEach(n => { if (!n.isRead) { n.isRead = true; count++; } });
  res.json({ marked: count });
});

// ── Helper: Extract user from JWT ──
function getUserFromToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return { id: 'unknown', name: 'Unknown', role: 'ORGANIZER' };
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find user in our store
    for (const [, user] of users) {
      if (user.id === decoded.id || user.email === decoded.email) {
        return { id: user.id, name: user.name, role: user.role, email: user.email };
      }
    }
    return { id: decoded.id, name: 'User', role: 'ORGANIZER' };
  } catch {
    return { id: 'unknown', name: 'Unknown', role: 'ORGANIZER' };
  }
}

// ── WebSocket Server — STOMP-compatible (alongside Express) ──

const wss = new WebSocketServer({ server, path: '/ws' });

// ── Minimal STOMP frame parser/serializer ──
function parseStompFrame(data) {
  const str = typeof data === 'string' ? data : data.toString();
  // STOMP frame: COMMAND\nheader:value\n...\n\nbody\0
  const nullIdx = str.indexOf('\0');
  const frame = nullIdx >= 0 ? str.substring(0, nullIdx) : str;
  const lines = frame.split('\n');
  const command = lines[0];
  const headers = {};
  let i = 1;
  for (; i < lines.length; i++) {
    if (lines[i] === '') break; // empty line separates headers from body
    const colonIdx = lines[i].indexOf(':');
    if (colonIdx > 0) {
      headers[lines[i].substring(0, colonIdx)] = lines[i].substring(colonIdx + 1);
    }
  }
  const body = lines.slice(i + 1).join('\n');
  return { command, headers, body };
}

function buildStompFrame(command, headers, body) {
  let frame = command + '\n';
  for (const [k, v] of Object.entries(headers)) {
    frame += `${k}:${v}\n`;
  }
  frame += '\n';
  if (body) frame += body;
  frame += '\0';
  return frame;
}

// Map: userId → Set<{ ws, subscriptions: Map<subId, destination> }>
const stompClients = new Map();

function getClientsForUser(uid) {
  return stompClients.get(String(uid)) || new Set();
}

wss.on('connection', (ws, req) => {
  let userId = null;
  const subscriptions = new Map(); // id → destination
  const clientInfo = { ws, subscriptions };

  // For SockJS compatibility: the client may also send raw JSON (non-STOMP)
  // or the initial connection may include a token in the URL
  const url = new URL(req.url, 'http://localhost');
  const urlToken = url.searchParams.get('token');

  ws.on('message', (raw) => {
    const str = typeof raw === 'string' ? raw : raw.toString();

    // ── Detect STOMP vs legacy JSON ──
    if (str.startsWith('CONNECT') || str.startsWith('SUBSCRIBE') || str.startsWith('SEND') ||
        str.startsWith('DISCONNECT') || str.startsWith('UNSUBSCRIBE') || str.startsWith('\n') ||
        str.startsWith('STOMP')) {
      handleStompFrame(str);
    } else {
      // Legacy JSON fallback (for backward compatibility during migration)
      handleLegacyJson(str);
    }
  });

  function handleStompFrame(raw) {
    // Handle heart-beat (empty line)
    if (raw.trim() === '' || raw === '\n') {
      ws.send('\n'); // STOMP heart-beat response
      return;
    }

    const frame = parseStompFrame(raw);

    switch (frame.command) {
      case 'CONNECT':
      case 'STOMP': {
        // Extract JWT from Authorization header or token header
        let token = null;
        if (frame.headers['Authorization']) {
          const auth = frame.headers['Authorization'];
          token = auth.startsWith('Bearer ') ? auth.substring(7) : auth;
        } else if (frame.headers['token']) {
          token = frame.headers['token'];
        } else if (urlToken) {
          token = urlToken;
        }

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id?.toString() || decoded.email;

            if (!stompClients.has(userId)) {
              stompClients.set(userId, new Set());
            }
            stompClients.get(userId).add(clientInfo);

            // Send CONNECTED frame
            ws.send(buildStompFrame('CONNECTED', {
              version: '1.2',
              'heart-beat': '10000,10000',
              server: 'eventra-mock/1.0',
              'user-name': userId,
            }, ''));

            console.log(`[STOMP] Connected: user ${userId}`);
          } catch (err) {
            ws.send(buildStompFrame('ERROR', {
              message: 'Authentication failed',
            }, 'Invalid or expired JWT token'));
            ws.close();
          }
        } else {
          ws.send(buildStompFrame('ERROR', {
            message: 'No credentials provided',
          }, 'Missing Authorization header'));
          ws.close();
        }
        break;
      }

      case 'SUBSCRIBE': {
        const subId = frame.headers['id'];
        const destination = frame.headers['destination'];
        if (subId && destination) {
          subscriptions.set(subId, destination);
          console.log(`[STOMP] User ${userId} subscribed: ${destination} (id: ${subId})`);
        }
        break;
      }

      case 'UNSUBSCRIBE': {
        const subId = frame.headers['id'];
        if (subId) {
          subscriptions.delete(subId);
        }
        break;
      }

      case 'SEND': {
        const destination = frame.headers['destination'];
        let body = {};
        try { body = JSON.parse(frame.body); } catch { body = { content: frame.body }; }

        if (destination === '/app/chat.send') {
          // Handle send message via STOMP
          const convId = parseInt(body.conversationId);
          const conv = conversations.get(convId);
          if (!conv || !userId) break;

          const user = findUserById(userId);
          const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const msg = {
            id: msgId,
            conversationId: convId,
            senderId: userId,
            senderName: user?.name || 'Unknown',
            senderRole: user?.role || 'ORGANIZER',
            messageType: body.messageType || 'TEXT',
            content: body.content || '',
            status: 'SENT',
            proposalAmount: body.proposalAmount,
            sponsorshipType: body.sponsorshipType,
            proposalTerms: body.proposalTerms,
            goodiesDescription: body.goodiesDescription,
            proposalDeadline: body.proposalDeadline,
            parentMessageId: body.parentMessageId,
            createdAt: new Date().toISOString(),
          };

          if (!conversationMessages.has(convId)) {
            conversationMessages.set(convId, []);
          }
          conversationMessages.get(convId).push(msg);

          // Update conversation metadata
          const preview = (msg.content || '').length > 100
            ? msg.content.substring(0, 100) + '...' : msg.content;
          conv.lastMessagePreview = preview;
          conv.lastMessageAt = msg.createdAt;

          // Broadcast to conversation topic subscribers
          broadcastToConversation(convId, msg, userId);

          // Send to recipient's personal queue
          const recipientId = String(conv.companyId) === userId
            ? String(conv.organizerId) : String(conv.companyId);
          sendToUserQueue(recipientId, '/queue/messages', msg);

        } else if (destination === '/app/chat.typing') {
          // Handle typing indicator
          const convId = body.conversationId;
          const typing = body.typing;
          broadcastToTopic(`/topic/conversation/${convId}/typing`, {
            conversationId: convId,
            userId,
            typing,
          }, userId);
        }
        break;
      }

      case 'DISCONNECT': {
        console.log(`[STOMP] Disconnect requested: user ${userId}`);
        ws.send(buildStompFrame('RECEIPT', {
          'receipt-id': frame.headers['receipt'] || 'disconnect',
        }, ''));
        break;
      }
    }
  }

  // ── Legacy JSON handler (backward compat) ──
  function handleLegacyJson(str) {
    try {
      const message = JSON.parse(str);
      switch (message.type) {
        case 'TYPING': {
          const { conversationId, typing } = message.data;
          broadcastToTopic(`/topic/conversation/${conversationId}/typing`, {
            conversationId, userId, typing
          }, userId);
          break;
        }
        case 'MARK_READ': {
          const { conversationId } = message.data;
          const conv = conversations.get(parseInt(conversationId));
          if (conv) {
            const msgs = conversationMessages.get(parseInt(conversationId)) || [];
            msgs.forEach(m => {
              if (m.senderId !== userId && m.status !== 'READ') {
                m.status = 'READ';
                m.readAt = new Date().toISOString();
              }
            });
            broadcastToTopic(`/topic/conversation/${conversationId}/read`, {
              conversationId, userId, readAt: new Date().toISOString()
            });
          }
          break;
        }
        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', data: { timestamp: Date.now() } }));
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parse error:', err.message);
    }
  }

  ws.on('close', () => {
    if (userId && stompClients.has(userId)) {
      stompClients.get(userId).delete(clientInfo);
      if (stompClients.get(userId).size === 0) {
        stompClients.delete(userId);
      }
      console.log(`[STOMP] Disconnected: user ${userId}`);
    }
  });

  ws.on('error', (err) => {
    console.error('[STOMP] WebSocket error:', err.message);
  });
});

// Find user by id helper
function findUserById(id) {
  for (const [, user] of users) {
    if (String(user.id) === String(id)) return user;
  }
  return null;
}

// ── STOMP-aware broadcast: send to all subscribers of a conversation topic ──
function broadcastToConversation(conversationId, payload, excludeUserId) {
  const topic = `/topic/conversation/${conversationId}`;
  broadcastToTopic(topic, payload, excludeUserId);
}

// ── Generic topic broadcaster: only sends to clients subscribed to the exact destination ──
function broadcastToTopic(destination, payload, excludeUserId) {
  const body = JSON.stringify(payload);
  for (const [uid, clientSet] of stompClients) {
    if (excludeUserId && String(uid) === String(excludeUserId)) continue;
    for (const client of clientSet) {
      if (client.ws.readyState !== 1) continue; // WebSocket.OPEN
      for (const [subId, subDest] of client.subscriptions) {
        if (subDest === destination) {
          client.ws.send(buildStompFrame('MESSAGE', {
            subscription: subId,
            destination,
            'message-id': `msg-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
            'content-type': 'application/json',
          }, body));
        }
      }
    }
  }
}

// ── Send to a specific user's queue (e.g., /queue/messages, /queue/notifications) ──
function sendToUserQueue(userId, queue, payload) {
  const clientSet = stompClients.get(String(userId));
  if (!clientSet) return;
  const body = JSON.stringify(payload);
  const destination = `/user/${userId}${queue}`;
  for (const client of clientSet) {
    if (client.ws.readyState !== 1) continue;
    for (const [subId, subDest] of client.subscriptions) {
      // Match /user/queue/messages (Spring resolves /user prefix automatically)
      if (subDest === `/user${queue}` || subDest === destination) {
        client.ws.send(buildStompFrame('MESSAGE', {
          subscription: subId,
          destination: subDest,
          'message-id': `msg-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
          'content-type': 'application/json',
        }, body));
      }
    }
  }
}

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`Gemini AI: ${GEMINI_API_KEY ? 'CONFIGURED (live)' : 'NOT CONFIGURED (using fallback responses)'}`);
  console.log(`Seeded ${conversations.size} demo conversations with messages`);
});
