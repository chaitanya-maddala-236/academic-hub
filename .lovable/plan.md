

# Plan: Publications Redesign, Favicon, and Branding Cleanup

## 1. Branding Changes

### Favicon
- Copy the uploaded graduation cap image (`user-uploads://image-7.png`) to `public/favicon.png`
- Update `index.html` to reference the new favicon

### Title and Meta Tags
- Change document title from "Lovable App" to "Academic Archives"
- Remove all Lovable references from `og:title`, `og:description`, `og:image`, `twitter:site`, `twitter:image`
- Update meta description to "Institutional Research & Academic Knowledge Platform"

## 2. Database Migration

The current `publications` table is missing several fields shown in the reference images. A migration will add:

- `authors` (text) -- comma-separated author names (e.g., "Dr. XYZ, Dr. ABC")
- `publisher` (text) -- e.g., "IEEE", "Elsevier"
- `indexing` (text array) -- e.g., ["Scopus", "SCI", "UGC"]
- `volume_issue` (text) -- e.g., "Vol. 12, Issue 4"
- `pages` (text) -- e.g., "233-245"
- `publication_date` (date) -- exact publication date
- `pub_type` (text) -- "national" or "international"

## 3. Publications Page Redesign

Completely rewrite `src/pages/Publications.tsx` to match the reference images:

### Header
- Blue banner: "PUBLICATIONS" title with underline accent
- Subtitle: "Research Output of the Institution"

### Search and Controls
- Full-width search bar ("Search by Title / Faculty / Journal")
- Filter dropdown button and Sort By Year dropdown

### Stats/Info Bar (horizontal tabs)
- Tabs: All (dot indicator), Journals
- Inline stats: year range, indexed count, international count, national count

### Two View Modes

**"All" tab -- Card-based layout** (matching image-8.png):
Each publication as a bordered card showing:
- Numbered title with "View Details" button
- Grid of details: Faculty, Authors, Journal, Publisher, Type, Date
- Indexing badges (Scopus, SCI styled tags)
- DOI with "Open DOI" button and profile/detail icon button

**"Journals" tab -- Table layout** (matching image-9.png):
- Section header: "JOURNAL PUBLICATIONS"
- Table columns: S.No, Faculty Name (with dept tag), Name of Author/s, Title of the Paper + Journal Name, Year, Indexing
- "View Details" button per row
- Previous/1/2/3.../Next pagination

### Side Filter Panel (right side)
Collapsible panel with checkbox filters:
- Publication Type: Journal / Conference
- Year: checkbox list (2025, 2024, 2023...)
- Department: checkbox list (CSE, ECE, MECH...)
- National / International: checkbox pair
- Indexing: text input or dropdown
- "Apply Filters" blue button at bottom

## 4. Files to Change

| File | Action |
|------|--------|
| `public/favicon.png` | Create (copy from upload) |
| `index.html` | Edit title, meta tags, favicon link |
| `src/pages/Publications.tsx` | Full rewrite with new card+table layout |
| Database migration | Add columns to publications table |

## 5. What Stays the Same
- Projects page UI -- no changes
- All other pages (Faculty, Patents, IP Assets, etc.) -- unchanged
- Sidebar navigation -- unchanged
- Login/Register pages -- already cleaned of branding

## Technical Details

### Publications Page Component Structure
```text
Publications
  +-- Blue Header Banner
  +-- Search Bar + Filter Button + Sort Dropdown
  +-- Stats/Tab Bar (All | Journals | year range | indexed | intl | natl)
  +-- Main Content Area
  |     +-- "All" mode: Stacked publication cards
  |     +-- "Journals" mode: Table with columns
  |     +-- Pagination (Previous 1 2 3 ... Next)
  +-- Side Filter Panel (conditionally shown)
        +-- Publication Type checkboxes
        +-- Year checkboxes
        +-- Department checkboxes
        +-- National/International checkboxes
        +-- Indexing filter
        +-- Apply Filters button
```

### Database Migration SQL
The migration adds nullable columns to `publications` so existing data is unaffected. All new fields are optional and will be populated via admin/SQL inserts.

