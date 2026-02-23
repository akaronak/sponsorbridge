# Eventra - Demo Data

## Sample Companies (Pre-loaded)

To make the demo more interesting, here are some sample companies you can add:

### Tech Companies

**1. TechCorp Solutions**
- Industry: Technology
- Location: San Francisco, CA
- Website: https://techcorp.com
- Contact: John Smith
- Sponsorship Types: Gold, Silver, Bronze
- Budget: $50,000 - $200,000
- Preferred Events: Tech Conferences, Hackathons, Meetups

**2. CloudBase Inc**
- Industry: Cloud Computing
- Location: Seattle, WA
- Website: https://cloudbase.io
- Contact: Sarah Johnson
- Sponsorship Types: Platinum, Gold
- Budget: $100,000 - $500,000
- Preferred Events: Enterprise Conferences, Developer Summits

**3. DataFlow Systems**
- Industry: Data Analytics
- Location: New York, NY
- Website: https://dataflow.com
- Contact: Michael Chen
- Sponsorship Types: Gold, Silver
- Budget: $30,000 - $150,000
- Preferred Events: Data Science Conferences, Analytics Summits

### Finance Companies

**4. FinanceHub Global**
- Industry: Financial Services
- Location: London, UK
- Website: https://financehub.co.uk
- Contact: Emma Wilson
- Sponsorship Types: Platinum, Gold
- Budget: $75,000 - $300,000
- Preferred Events: Finance Conferences, Investment Summits

**5. PaymentPro**
- Industry: Fintech
- Location: Austin, TX
- Website: https://paymentpro.com
- Contact: David Rodriguez
- Sponsorship Types: Gold, Silver, Bronze
- Budget: $40,000 - $180,000
- Preferred Events: Fintech Conferences, Payment Summits

### E-Commerce Companies

**6. ShopHub Solutions**
- Industry: E-Commerce
- Location: Los Angeles, CA
- Website: https://shophub.com
- Contact: Lisa Anderson
- Sponsorship Types: Gold, Silver
- Budget: $60,000 - $250,000
- Preferred Events: E-Commerce Conferences, Retail Summits

---

## Sample Events (For Organizers)

### Tech Events

**1. TechConf 2026**
- Expected Audience: 5,000
- Date: June 15-17, 2026
- Location: San Francisco, CA
- Sponsorship Ask: $50,000
- Event Type: Technology Conference

**2. StartupWeekend**
- Expected Audience: 500
- Date: April 20-22, 2026
- Location: Multiple Cities
- Sponsorship Ask: $25,000
- Event Type: Hackathon

**3. DevSummit 2026**
- Expected Audience: 2,000
- Date: May 10-12, 2026
- Location: Seattle, WA
- Sponsorship Ask: $75,000
- Event Type: Developer Conference

### Finance Events

**4. FinanceExpo 2026**
- Expected Audience: 3,000
- Date: July 8-10, 2026
- Location: New York, NY
- Sponsorship Ask: $100,000
- Event Type: Finance Conference

**5. FinTech Innovation Summit**
- Expected Audience: 1,500
- Date: August 15-17, 2026
- Location: Austin, TX
- Sponsorship Ask: $60,000
- Event Type: Fintech Conference

---

## How to Add Sample Data

### Option 1: Manual Entry
1. Register as a Company
2. Create your company profile
3. Register as an Organizer
4. Create sponsorship requests

### Option 2: API Direct Call
Use curl or Postman to add data directly:

```bash
# Register a company
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "techcorp@example.com",
    "password": "password123",
    "name": "TechCorp Solutions",
    "role": "COMPANY"
  }'

# Create company profile
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "companyName": "TechCorp Solutions",
    "industry": "Technology",
    "location": "San Francisco, CA",
    "website": "https://techcorp.com",
    "contactPerson": "John Smith",
    "sponsorshipTypes": ["Gold", "Silver", "Bronze"],
    "budgetMin": 50000,
    "budgetMax": 200000,
    "preferredEventTypes": ["Conference", "Hackathon", "Meetup"]
  }'
```

---

## Testing Workflows

### Workflow 1: Company Registration & Profile
1. Click "Register"
2. Enter email: `company1@test.com`
3. Enter name: `TechCorp`
4. Enter password: `password123`
5. Select role: `COMPANY`
6. Click "Register"
7. You're now logged in as a company

### Workflow 2: Organizer Sponsorship Request
1. Register as organizer: `organizer1@test.com`
2. Go to "Companies" page
3. Browse available companies
4. Click "Send Sponsorship Request"
5. Enter event name and sponsorship ask
6. Request is sent to the company

### Workflow 3: Company Responds to Request
1. Login as company
2. View incoming sponsorship requests
3. Accept or reject requests
4. Send messages to organizers

---

## Performance Notes

- The demo uses in-memory storage
- All data is lost when the server restarts
- Perfect for testing and demonstrations
- For production, integrate with PostgreSQL

---

## Next Steps

1. **Add Real Database:** Replace in-memory storage with PostgreSQL
2. **Email Notifications:** Send emails when requests are received
3. **File Uploads:** Allow companies to upload logos and proposals
4. **Advanced Search:** Filter companies by multiple criteria
5. **Analytics Dashboard:** Track sponsorship trends and metrics
6. **Payment Integration:** Process sponsorship payments
7. **Admin Panel:** Manage users and verify profiles

---

Enjoy exploring Eventra! 🌉
