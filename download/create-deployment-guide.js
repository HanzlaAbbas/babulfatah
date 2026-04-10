const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber,
  PageBreak, TableOfContents, ExternalHyperlink
} = require("docx");

// "Midnight Code" color palette
const C = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  white: "FFFFFF",
  gold: "D4AF37",
  brand: "1D333B",
};

const bdr = { style: BorderStyle.SINGLE, size: 8, color: C.accent };
const cellBorders = { top: bdr, bottom: bdr, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } };
const headerBorders = { top: bdr, bottom: { style: BorderStyle.SINGLE, size: 12, color: C.primary }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 300 }, children: [new TextRun({ text, font: "Times New Roman", size: 36, bold: true, color: C.primary })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, font: "Times New Roman", size: 28, bold: true, color: C.primary })] });
}
function body(text, opts = {}) {
  return new Paragraph({ spacing: { after: 160, line: 250 }, alignment: AlignmentType.LEFT, ...opts, children: [new TextRun({ text, font: "Calibri", size: 22, color: C.body })] });
}
function bodyBold(label, text) {
  return new Paragraph({ spacing: { after: 160, line: 250 }, children: [
    new TextRun({ text: label, font: "Calibri", size: 22, color: C.primary, bold: true }),
    new TextRun({ text, font: "Calibri", size: 22, color: C.body })
  ]});
}
function code(text) {
  return new Paragraph({ spacing: { after: 120, line: 250 }, indent: { left: 360 }, shading: { fill: "F1F5F9", type: ShadingType.CLEAR }, children: [
    new TextRun({ text, font: "Courier New", size: 20, color: "334155" })
  ]});
}
function codeBlock(lines) {
  return lines.map(l => code(l));
}
function bullet(text, ref = "bl") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 100, line: 250 }, children: [new TextRun({ text, font: "Calibri", size: 22, color: C.body })] });
}
function numberedItem(text, ref) {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 100, line: 250 }, children: [new TextRun({ text, font: "Calibri", size: 22, color: C.body })] });
}
function note(text) {
  return new Paragraph({ spacing: { after: 160, line: 250 }, indent: { left: 360 }, children: [
    new TextRun({ text: "Note: ", font: "Calibri", size: 22, color: "B45309", bold: true, italics: true }),
    new TextRun({ text, font: "Calibri", size: 22, color: "92400E", italics: true })
  ]});
}

function tableHeaderCell(text, width) {
  return new TableCell({ borders: headerBorders, width: { size: width, type: WidthType.DXA }, shading: { fill: C.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: "Calibri", size: 20, color: C.primary })] })] });
}
function tableCell(text, width) {
  return new TableCell({ borders: cellBorders, width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 250 }, children: [new TextRun({ text, font: "Calibri", size: 20, color: C.body })] })] });
}

const bulletConfigs = [];
const numConfigs = [];
for (let i = 1; i <= 20; i++) {
  bulletConfigs.push({ reference: `bl${i > 1 ? i : ""}`, levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
  numConfigs.push({ reference: `num${i}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: C.body } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Times New Roman", color: C.primary }, paragraph: { spacing: { before: 600, after: 300 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Times New Roman", color: C.primary }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [...bulletConfigs, ...numConfigs] },
  sections: [
    // ─── COVER PAGE ───
    {
      properties: {
        page: { margin: { top: 0, bottom: 0, left: 0, right: 0 }, size: { width: 11906, height: 16838 } },
        titlePage: true,
      },
      children: [
        new Paragraph({ spacing: { before: 4000 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645", font: "Times New Roman", size: 32, color: C.gold })] }),
        new Paragraph({ spacing: { before: 600 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "BAB-UL-FATAH", font: "Times New Roman", size: 72, bold: true, color: C.primary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Islamic E-Commerce Platform", font: "Times New Roman", size: 32, color: C.secondary })] }),
        new Paragraph({ spacing: { before: 1200 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Production Deployment Guide", font: "Calibri", size: 36, color: C.primary, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Vercel + Neon PostgreSQL + DNS Configuration", font: "Calibri", size: 24, color: C.secondary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 }, children: [new TextRun({ text: "Prepared: April 2026", font: "Calibri", size: 22, color: C.accent })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Version 1.0 \u2014 Confidential", font: "Calibri", size: 22, color: C.accent })] }),
      ]
    },
    // ─── TOC + MAIN CONTENT ───
    {
      properties: {
        page: { margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Bab-ul-Fatah \u2014 Deployment Guide", font: "Calibri", size: 18, color: C.accent, italics: true })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u2014 ", font: "Calibri", size: 18, color: C.accent }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: C.accent }), new TextRun({ text: " \u2014", font: "Calibri", size: 18, color: C.accent })] })] })
      },
      children: [
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: "Note: Right-click the Table of Contents and select \"Update Field\" to refresh page numbers.", font: "Calibri", size: 18, color: "999999" })] }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══ 1. EXECUTIVE SUMMARY ═══
        h1("1. Executive Summary"),
        body("This deployment guide provides complete step-by-step instructions for launching the Bab-ul-Fatah Islamic e-commerce platform to production. The platform is a modern Next.js 16 application with a full-featured storefront, admin panel, AI-powered chatbot (Salamee), and PostgreSQL database hosted on Neon.tech. The guide covers three critical deployment tasks: deploying the application to Vercel, configuring DNS for both the .com and .pk domains, and implementing a traffic-driving strategy for the .pk domain."),
        body("The application has been fully built and tested with 1,411 products, 139 authors, 51 categories, 5,085 product images, and all 15 API routes verified working. The codebase includes a complete admin panel, product search with stock-first sorting, newsletter subscriptions, contact forms, order management, and SEO-optimized pages with structured data and sitemap generation. All malware has been removed from the server, WordPress has been cleanly swept, and a \"Coming Soon\" placeholder is live on the existing hosting."),

        // ═══ 2. CURRENT STATUS ═══
        h1("2. Current Status Overview"),
        h2("2.1 Application Status"),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [3500, 5860],
          margins: { top: 80, bottom: 80, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [tableHeaderCell("Component", 3500), tableHeaderCell("Status", 5860)] }),
            new TableRow({ children: [tableCell("Next.js Build", 3500), tableCell("Passing (1,411+ pages generated)", 5860)] }),
            new TableRow({ children: [tableCell("TypeScript", 3500), tableCell("0 errors in src/ files", 5860)] }),
            new TableRow({ children: [tableCell("Database (Neon)", 3500), tableCell("6,687 records migrated successfully", 5860)] }),
            new TableRow({ children: [tableCell("Products", 3500), tableCell("1,411 products (810 in stock)", 5860)] }),
            new TableRow({ children: [tableCell("API Routes", 3500), tableCell("15 routes (auth, admin, storefront)", 5860)] }),
            new TableRow({ children: [tableCell("Security", 3500), tableCell("All malware removed, server clean", 5860)] }),
            new TableRow({ children: [tableCell("WordPress", 3500), tableCell("Fully removed (backup saved)", 5860)] }),
            new TableRow({ children: [tableCell("Git Commit", 3500), tableCell("Ready (needs push from your machine)", 5860)] }),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: "Table 1: Application readiness checklist", font: "Calibri", size: 18, color: C.secondary, italics: true })] }),

        h2("2.2 Domain Status"),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [2400, 3200, 3760],
          margins: { top: 80, bottom: 80, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [tableHeaderCell("Domain", 2400), tableHeaderCell("Nameservers", 3200), tableHeaderCell("Action Needed", 3760)] }),
            new TableRow({ children: [tableCell("babulfatah.com", 2400), tableCell("ns1/ns2.nvmhoster.com", 3200), tableCell("Change A record to Vercel", 3760)] }),
            new TableRow({ children: [tableCell("babulfatah.pk", 2400), tableCell("ns1/ns2.nextbytedns.com", 3200), tableCell("Change NS at registrar to nvmhoster", 3760)] }),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: "Table 2: Domain configuration status", font: "Calibri", size: 18, color: C.secondary, italics: true })] }),

        // ═══ 3. DEPLOY TO VERCEL ═══
        h1("3. Deploy to Vercel (Step-by-Step)"),
        body("Vercel is the recommended hosting platform for Next.js applications. It provides automatic builds, global CDN, serverless functions for API routes, and seamless Git integration. The free Hobby plan is sufficient for the Bab-ul-Fatah platform and includes custom domain support, SSL certificates, and unlimited serverless function invocations."),
        
        h2("3.1 Prerequisites"),
        body("Before starting the Vercel deployment, ensure you have the following items ready. You will need a Vercel account (sign up free at vercel.com using your GitHub account), the Neon PostgreSQL database connection string (available from your Neon dashboard at neon.tech), and a GitHub personal access token if you plan to use GitHub authentication for deployment."),
        
        h2("3.2 Push Code to GitHub"),
        body("The code has been committed locally but needs to be pushed from your machine since the sandbox environment lacks GitHub credentials. Run the following commands in your terminal from the project directory:"),
        ...codeBlock([
          "cd /path/to/babulfatah",
          "git remote set-url origin https://github.com/HanzlaAbbas/babulfatah.git",
          "git add .",
          'git commit -m "Phase 6: Production Launch"',
          "git branch -M main",
          "git push -u origin main",
        ]),
        note("If prompted for credentials, use a Personal Access Token (not your password). Generate one at GitHub Settings > Developer Settings > Personal Access Tokens > Generate New Token with 'repo' scope."),

        h2("3.3 Create Vercel Project"),
        body("Follow these steps to create and configure your Vercel project. This process connects your GitHub repository to Vercel for automatic deployments whenever you push code changes:"),
        numberedItem("Go to https://vercel.com and sign in with your GitHub account (username: HanzlaAbbas)", "num1"),
        numberedItem("Click \"Add New Project\" then \"Import Git Repository\"", "num1"),
        numberedItem("Select the \"babulfatah\" repository from your GitHub account", "num1"),
        numberedItem("Configure the project settings as follows:", "num1"),
        body("Framework Preset: Next.js (auto-detected)", { indent: { left: 720 } }),
        body("Build Command: npx prisma generate && next build", { indent: { left: 720 } }),
        body("Install Command: npm install", { indent: { left: 720 } }),
        body("Output Directory: .next (leave default)", { indent: { left: 720 } }),
        body("Node.js Version: 18.x or 20.x", { indent: { left: 720 } }),
        numberedItem("Click \"Deploy\" and wait for the build to complete (approximately 2-3 minutes)", "num1"),
        note("Vercel automatically detects the Next.js configuration from vercel.json. The build command includes 'npx prisma generate' which is required to generate the Prisma Client before building the application."),

        h2("3.4 Set Environment Variables on Vercel"),
        body("After the project is created, you must configure environment variables. These are critical for the application to connect to the database and handle authentication. Navigate to your Vercel project dashboard, go to Settings > Environment Variables, and add the following variables:"),
        ...codeBlock([
          "DATABASE_URL = postgresql://user:password@ep-xxx.region.aws.neon.tech/babulfatah?sslmode=require",
          "NEXTAUTH_SECRET = <generate-a-random-32-char-string>",
          "NEXTAUTH_URL = https://www.babulfatah.com",
        ]),
        body("For the DATABASE_URL, copy the connection string from your Neon dashboard (neon.tech > your project > Connection Details). Make sure to use the pooled connection string if available for better performance. The NEXTAUTH_SECRET should be a random string \u2014 generate one by running: openssl rand -base64 32 in your terminal."),
        note("Set all three variables for Production, Preview, and Development environments. This ensures consistent behavior across all deployment stages."),

        h2("3.5 Redeploy After Setting Environment Variables"),
        body("After adding environment variables, you must trigger a new deployment for them to take effect. Go to Deployments in your Vercel dashboard, find the latest deployment, click the three-dot menu, and select \"Redeploy\". Alternatively, push a new commit to GitHub which will automatically trigger a fresh deployment with the correct environment variables."),

        // ═══ 4. DNS CONFIGURATION ═══
        h1("4. DNS Configuration"),
        body("After deploying to Vercel, your application will be accessible at a Vercel-generated URL (e.g., babulfatah.vercel.app). To connect your custom domain (www.babulfatah.com), you need to configure DNS records. This section covers DNS setup for both your .com and .pk domains."),

        h2("4.1 Add Custom Domain in Vercel"),
        body("First, add your domain in the Vercel dashboard. Go to your project Settings > Domains, then add both of these domains:"),
        bullet("babulfatah.com", "bl2"),
        bullet("www.babulfatah.com", "bl2"),
        bullet("babulfatah.pk", "bl2"),
        bullet("www.babulfatah.pk", "bl2"),
        body("Vercel will display the DNS records you need to add. Follow the specific instructions for each domain below."),

        h2("4.2 Configure babulfatah.com DNS"),
        body("Log into your hosting control panel at nvmhoster.com (cPanel access at babulfatah.com:2083). Navigate to the DNS Zone Editor for babulfatah.com and modify the following records:"),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [1800, 2400, 2400, 2760],
          margins: { top: 80, bottom: 80, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [tableHeaderCell("Type", 1800), tableHeaderCell("Name", 2400), tableHeaderCell("Value", 2400), tableHeaderCell("Notes", 2760)] }),
            new TableRow({ children: [tableCell("A", 1800), tableCell("@", 2400), tableCell("76.76.21.21", 2400), tableCell("Vercel apex domain", 2760)] }),
            new TableRow({ children: [tableCell("CNAME", 1800), tableCell("www", 2400), tableCell("cname.vercel-dns.com", 2400), tableCell("Vercel www subdomain", 2760)] }),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: "Table 3: DNS records for babulfatah.com", font: "Calibri", size: 18, color: C.secondary, italics: true })] }),
        note("Remove any existing A records that point to the old server IP (162.55.236.146). Keep the existing nameserver records (ns1/ns2.nvmhoster.com) unchanged. DNS propagation may take up to 48 hours, though typically completes within 15 minutes to 4 hours."),

        h2("4.3 Fix babulfatah.pk Nameservers"),
        body("The .pk domain is currently pointing to nameservers at nextbytedns.com which is NOT your hosting provider. This means the .pk domain is not resolving correctly and any traffic to it is going to the wrong server. You need to change the nameservers at the domain registrar where the .pk domain was purchased (likely PKNIC or a .pk reseller)."),
        bodyBold("Required Action: ", "Log into your .pk domain registrar account (where you purchased babulfatah.pk) and change the nameservers from:"),
        ...codeBlock(["  ns1.nextbytedns.com", "  ns2.nextbytedns.com"]),
        body("To the correct nameservers for your hosting:"),
        ...codeBlock(["  ns1.nvmhoster.com", "  ns2.nvmhoster.com"]),
        note("This change MUST be made at the domain registrar level (PKNIC or the reseller who sold you the .pk domain). It cannot be done through cPanel. If you do not know where the .pk domain was registered, use a WHOIS lookup tool (such as whois.pk or nic.pk) to find the registrar information."),
        body("After changing the nameservers, it will take 24-48 hours for the changes to propagate globally. Once propagated, you can then add DNS records (similar to step 4.2) in your cPanel DNS Zone Editor to point the .pk domain to Vercel."),

        // ═══ 5. .PK TRAFFIC STRATEGY ═══
        h1("5. Traffic Strategy for babulfatah.pk"),
        body("The .pk domain carries significant SEO value for the Pakistani market. With Pakistan being one of the largest markets for Islamic literature globally, a well-optimized .pk domain can drive substantial organic traffic. This section outlines a comprehensive strategy to maximize the traffic potential of babulfatah.pk."),

        h2("5.1 Domain Purpose and Architecture"),
        body("The recommended approach is to use babulfatah.pk as a geo-targeted Pakistani storefront that operates alongside the main .com site. Both domains should serve the same application (deployed on Vercel) but with different configurations and SEO strategies. The .pk domain signals to Google that the content is specifically relevant for Pakistani users, which improves local search rankings significantly."),
        body("The architecture should be as follows: both domains point to the same Vercel deployment, but the application detects the domain and adjusts metadata, currency display (PKR), and content priorities accordingly. This eliminates the need for duplicate codebases while maximizing SEO benefits for both domains."),

        h2("5.2 SEO Optimization for .pk Domain"),
        bullet("Set up Google Search Console separately for babulfatah.pk and submit the sitemap (babulfatah.pk/sitemap.xml)", "bl3"),
        bullet("Create Pakistan-specific meta descriptions emphasizing local features: Cash on Delivery, nationwide shipping across all cities including Karachi, Lahore, Islamabad, Peshawar, Quetta", "bl3"),
        bullet("Implement hreflang tags linking .com and .pk versions for proper international SEO", "bl3"),
        bullet("Target Pakistan-specific keywords: 'Islamic books Pakistan', 'Urdu Islamic books online', 'Quran with Urdu translation Pakistan', 'Hadith books Pakistan online'", "bl3"),
        bullet("Register the business on Google Business Profile (Google Maps) with the .pk domain as the website URL", "bl3"),
        bullet("Create content pages targeting local Islamic events, Ramadan book collections, Eid gift guides, and seasonal promotions", "bl3"),

        h2("5.3 Google Search Console Setup"),
        body("Google Search Console is essential for monitoring and improving your search performance. Set it up as follows:"),
        numberedItem("Go to https://search.google.com/search-console and add a new property for babulfatah.pk", "num2"),
        numberedItem("Verify domain ownership using the DNS record method (add a TXT record in cPanel DNS Zone Editor)", "num2"),
        numberedItem("Submit the sitemap URL: https://babulfatah.pk/sitemap.xml", "num2"),
        numberedItem("Set the target country to Pakistan in Search Console settings (International Targeting)", "num2"),
        numberedItem("Monitor indexing status and fix any crawl errors weekly", "num2"),

        h2("5.4 Content Marketing Strategy"),
        body("Content marketing is the most effective long-term traffic driver for the .pk domain. Create a blog section with articles that target specific search queries from Pakistani Islamic book buyers. Recommended content pillars include:"),
        bullet("Book Reviews: Detailed reviews of popular Islamic titles with 'buy now' CTAs linking to product pages. Target queries like 'Best Seerah books in Urdu review'", "bl4"),
        bullet("Reading Guides: Curated lists such as 'Top 10 Hadith Collections for Beginners', 'Essential Fiqh Books for Every Muslim Home', 'Best Islamic Books for Children in Pakistan'", "bl4"),
        bullet("Author Spotlights: Feature articles about renowned Islamic scholars whose books you carry (e.g., Maulana Wahiduddin Khan, Shaykh al-Islam Ibn Taymiyyah, Imam Ghazzali)", "bl4"),
        bullet("Seasonal Content: Ramadan reading guides, Eid gift recommendations, Muharram book collections, Islamic New Year reading lists", "bl4"),
        bullet("Urdu Content: Since the majority of Pakistani internet users prefer Urdu content, creating Urdu-language blog posts will significantly boost organic traffic from Google Pakistan", "bl4"),

        h2("5.5 Social Media Integration"),
        body("Leverage Pakistani social media platforms to drive traffic to the .pk domain. Facebook and Instagram are the dominant platforms in Pakistan, with WhatsApp being the primary communication channel. Create platform-specific strategies that funnel users to the website for purchases."),
        bullet("Facebook: Create a dedicated business page, post daily book recommendations with direct links to .pk product pages, run Facebook Marketplace listings", "bl5"),
        bullet("Instagram: Use Reels and Stories for book unboxing videos, aesthetic flat-lay photography of Islamic books, quote cards from featured titles", "bl5"),
        bullet("WhatsApp: The existing WhatsApp floating button should be prominently featured. Consider adding a WhatsApp catalog for direct ordering", "bl5"),
        bullet("YouTube: Book review videos in Urdu can drive significant traffic. Partner with Pakistani Islamic book reviewers and influencers for wider reach", "bl5"),

        // ═══ 6. ENVIRONMENT VARIABLES REFERENCE ═══
        h1("6. Environment Variables Reference"),
        body("The following environment variables must be configured on Vercel for the application to function correctly. These are set in the Vercel dashboard under Settings > Environment Variables:"),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [2600, 1600, 5160],
          margins: { top: 80, bottom: 80, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [tableHeaderCell("Variable", 2600), tableHeaderCell("Required", 1600), tableHeaderCell("Description", 5160)] }),
            new TableRow({ children: [tableCell("DATABASE_URL", 2600), tableCell("Yes", 1600), tableCell("Neon PostgreSQL connection string (with ?sslmode=require)", 5160)] }),
            new TableRow({ children: [tableCell("NEXTAUTH_SECRET", 2600), tableCell("Yes", 1600), tableCell("Random 32+ character string for JWT signing (openssl rand -base64 32)", 5160)] }),
            new TableRow({ children: [tableCell("NEXTAUTH_URL", 2600), tableCell("Yes", 1600), tableCell("Production URL: https://www.babulfatah.com", 5160)] }),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: "Table 4: Required environment variables for Vercel", font: "Calibri", size: 18, color: C.secondary, italics: true })] }),

        // ═══ 7. POST-DEPLOYMENT CHECKLIST ═══
        h1("7. Post-Deployment Checklist"),
        body("After completing all the deployment steps, verify the following items to ensure everything is working correctly. This checklist should be completed in order:"),
        numberedItem("Vercel deployment builds successfully without errors", "num3"),
        numberedItem("Homepage loads at the Vercel URL (babulfatah.vercel.app) with all products visible", "num3"),
        numberedItem("Product pages load correctly with images, stock status, and add-to-cart functionality", "num3"),
        numberedItem("Search functionality works (try searching for 'Quran' or 'Hadith')", "num3"),
        numberedItem("Admin panel accessible at /admin/login (login: admin@babulfatah.com)", "num3"),
        numberedItem("DNS records configured for .com domain (A record + CNAME)", "num3"),
        numberedItem("Custom domain shows as 'Valid Configuration' in Vercel dashboard", "num3"),
        numberedItem("SSL certificate auto-provisioned by Vercel (check with padlock icon in browser)", "num3"),
        numberedItem("www.babulfatah.com loads the live site", "num3"),
        numberedItem("babulfatah.com redirects to www.babulfatah.com (or vice versa)", "num3"),
        numberedItem("Google Search Console set up for both domains", "num3"),
        numberedItem("Sitemap accessible at /sitemap.xml for both domains", "num3"),
        numberedItem("robots.txt accessible at /robots.txt", "num3"),
        numberedItem("Salamee AI chatbot responds on the homepage", "num3"),
        numberedItem("WhatsApp floating button visible and functional", "num3"),
        numberedItem("Contact form submits successfully", "num3"),
        numberedItem("Newsletter subscription works", "num3"),
        numberedItem(".pk domain nameservers changed at registrar (pending propagation)", "num3"),

        // ═══ 8. TROUBLESHOOTING ═══
        h1("8. Troubleshooting"),
        h2("8.1 Build Failures on Vercel"),
        body("If the Vercel build fails, the most common cause is missing or incorrect environment variables. Ensure DATABASE_URL is set correctly and points to the Neon PostgreSQL database. Check the Vercel build logs for specific error messages. If the error mentions Prisma, verify the build command includes 'npx prisma generate'. If it mentions missing modules, check that the package.json dependencies are correct."),
        h2("8.2 Database Connection Errors"),
        body("If you see 'PrismaClientInitializationError' in the Vercel function logs, the DATABASE_URL is either missing, incorrect, or the Neon database is paused. Neon auto-pauses free-tier databases after inactivity. The first request after a pause may take 5-10 seconds. If the error persists, verify the connection string includes the sslmode=require parameter and that the database user has the correct permissions."),
        h2("8.3 DNS Propagation Issues"),
        body("DNS changes can take up to 48 hours to propagate globally, though they typically resolve within 15 minutes to 4 hours. Use the tool at https://dnschecker.org to monitor DNS propagation in real-time. If DNS is not propagating, double-check that you have removed conflicting records and that the DNS records match exactly what Vercel specifies in the domain configuration panel."),
        h2("8.4 Images Not Loading"),
        body("Product images are loaded from external CDN sources (Cloudinary, darussalam.pk, cdn.shopify.com, babussalam.pk). If images fail to load, check that these domains are listed in the images.remotePatterns array in next.config.ts. The configuration already includes all necessary domains. If new image sources are added in the future, they must be added to this configuration and the app redeployed."),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/Bab_ul_Fatah_Deployment_Guide.docx", buffer);
  console.log("Deployment guide created successfully!");
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
