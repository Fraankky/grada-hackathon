# Grada Business Wizard - Complete Flow Documentation

## Overview
The Grada platform provides a 4-step business planning wizard that analyzes financial documents using AI and provides personalized business recommendations, equipment suggestions, and strategic planning.

## Complete User Flow

### Step 1: Upload & Analysis (`/` - StepUpload)
**Location**: `src/components/platform/StepUpload.jsx`

**Actions**:
1. User uploads PDF financial report
2. User selects mode: Business or Crypto Investment
3. System calls:
   - `learnFromPdf()` - Uploads PDF to AI service to learn from document
   - `analyzeBusinessDocument()` - Analyzes business potential from document
   - `getTrendsData()` - Gets trending business ideas with SerpAPI validation
4. Data stored in BusinessWizardContext:
   - `userUuid` - Generated unique identifier
   - `financialAnalysis` - Liquid capital, risk profile, capital range
   - `businessTrends` - Array of trending business ideas
   - `trendsSummary` - Summary text from AI
   - `categorizedTrends` - Trends grouped by category
   - `validationSummary` - SerpAPI validation stats
5. Redirects to `/wizard/business?userUuid={uuid}`

**APIs Called**:
- `POST /api/v1/user/agent/data-layer/learn/pdf` - Learn from PDF
- `POST /api/v1/user/agent/business/analyze` - Analyze business
- `POST /api/v1/user/agent/business/trends` - Get trends

---

### Step 2: Business Selection (`/wizard/business` - StepBusinessChoice)
**Location**: `src/components/platform/StepBusinessChoice.jsx`

**Display**:
1. Financial Analysis Summary:
   - Liquid capital amount
   - Risk profile (Conservative/Moderate/Aggressive)
   - Capital range (min-max)
2. AI Recommendation Summary (text)
3. Trending Business Ideas (clickable cards):
   - Business category name
   - Reason for recommendation
   - Validation info (search result count from SerpAPI)
4. Validation summary showing how many trends were validated

**Actions**:
1. User selects one business category from trending ideas
2. System stores `selectedCategory` in context
3. Redirects to `/wizard/equipment?userUuid={uuid}`

---

### Step 3: Equipment Selection (`/wizard/equipment` - StepEquipment)
**Location**: `src/components/platform/StepEquipment.jsx`

**Actions**:
1. System calls `getBusinessData()` with userUuid and selectedCategory
2. Fetches:
   - Equipment list (required & optional items)
   - Business advisor recommendations
   - Strategies
   - Warnings

**Display**:
1. Required Equipment:
   - Name, description, price
   - Add to cart button
2. Optional Equipment:
   - Name, description, price
   - Add to cart button
3. Shopping Cart Summary:
   - Selected items count
   - Total price
   - Estimated cost from AI

**Actions**:
1. User adds/removes items to cart (stored in `cartItems` in context)
2. User clicks "Checkout & Lanjut ke Strategi"
3. System calls `orderEquipment()` to place order
4. Redirects to `/wizard/result?userUuid={uuid}`

**APIs Called**:
- `POST /api/v1/user/agent/business/advisor` - Get business strategies
- `POST /api/v1/user/agent/business/equipment` - Get equipment list
- `POST /api/v1/user/agent/business/order` - Place equipment order

---

### Step 4: Business Strategy & Planning (`/wizard/result` - StepResult)
**Location**: `src/components/platform/StepResult.jsx`

**Actions**:
1. System calls `getBusinessPlanning()` with userUuid
2. Fetches:
   - Strategy summary
   - Action steps (implementation steps)
   - Timeline (execution timeline)
   - Risks and warnings

**Display**:
1. Strategy Summary (AI-generated business plan overview)
2. Implementation Steps (numbered action list)
3. Execution Timeline (bullet points)
4. Risks & Things to Watch
5. Equipment Purchase Summary:
   - List of purchased items with prices
   - Total amount spent

**Actions**:
1. User reviews final business plan
2. User can go back to previous steps or finish
3. "Selesai & Kembali ke Awal" returns to Step 1

**APIs Called**:
- `POST /api/v1/user/agent/business/planning` - Get business planning strategy

---

## Context State Management

**BusinessWizardContext** (`src/context/BusinessWizardContext.jsx`) stores:

```javascript
{
  userUuid: string,              // User session ID
  selectedCategory: string,       // Chosen business category
  mode: string,                   // "business" or "crypto"
  financialAnalysis: {            // From analyzeBusinessDocument
    liquid_capital: number,
    risk_profile: string,
    capital_range: {
      min_capital: number,
      max_capital: number
    }
  },
  businessTrends: Array,          // From getTrendsData
  trendsSummary: string,          // From getTrendsData
  categorizedTrends: Object,      // From getTrendsData
  validationSummary: Object,      // From getTrendsData
  cartItems: Array                // Selected equipment items
}
```

---

## API Service Functions

All located in `src/lib/ai-service.js`:

### Document Learning & Analysis
- `learnFromPdf({ file, userUuid, debug })` - Upload PDF for AI learning
- `analyzeBusinessDocument({ userUuid, debug })` - Analyze business potential

### Business Intelligence
- `getTrendsData({ userUuid, debug })` - Get trending business ideas
- `getBusinessData({ userUuid, bisnisKategori, debug })` - Get equipment & advisor
- `getBusinessAdvisor({ userUuid, bisnisKategori, debug })` - Get strategies
- `getBusinessEquipment({ userUuid, debug })` - Get equipment recommendations

### Orders & Planning
- `orderEquipment({ userUuid, items, paymentInfo, debug })` - Place equipment order
- `getBusinessPlanning({ userUuid, debug })` - Get final business plan

---

## Navigation Flow

```
┌─────────────────┐
│  Step 1: Upload │  /
│  (StepUpload)   │  
└────────┬────────┘
         │ PDF + Mode
         │ learnFromPdf()
         │ analyzeBusinessDocument()
         │ getTrendsData()
         ▼
┌─────────────────────────┐
│  Step 2: Business Choice│  /wizard/business
│  (StepBusinessChoice)   │  
└────────┬────────────────┘
         │ Select Category
         ▼
┌─────────────────────────┐
│  Step 3: Equipment      │  /wizard/equipment
│  (StepEquipment)        │  
└────────┬────────────────┘
         │ getBusinessData()
         │ Select Items
         │ orderEquipment()
         ▼
┌─────────────────────────┐
│  Step 4: Planning       │  /wizard/result
│  (StepResult)           │  
└────────┬────────────────┘
         │ getBusinessPlanning()
         │ Review & Finish
         ▼
         ✓ Complete
```

---

## Key Features

1. **AI-Powered Analysis**: Uses external LLM service to analyze financial documents
2. **Trend Validation**: Validates business ideas using SerpAPI search results
3. **Personalized Recommendations**: Based on financial profile and risk tolerance
4. **Equipment Marketplace**: Curated list of required and optional business equipment
5. **Strategic Planning**: Complete business strategy with implementation timeline
6. **State Persistence**: All data persisted in React Context throughout wizard

---

## Environment Variables Required

```env
# LLM API Configuration
LLM_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_LLM_API_BASE_URL=https://your-backend-api.com
BACKEND_BASE_URL=https://your-backend-api.com
BACKEND_API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://...
```

---

## Testing the Flow

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Upload a PDF financial report
4. Select "Bisnis" mode
5. Wait for AI analysis (check console for API logs)
6. Select a business category from trending ideas
7. Add equipment items to cart
8. Checkout to see final business strategy

---

## Notes

- All API calls include `debug: true` flag for development logging
- UserUuid is generated client-side using `crypto.randomUUID()`
- Cart items are stored in context, not persisted to database
- All prices are displayed in Indonesian Rupiah (IDR) format
- Navigation uses query parameters to pass userUuid between steps
