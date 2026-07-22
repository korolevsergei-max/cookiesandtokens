import type { ImageMetadata } from "astro";

import approachImage from "../assets/case-studies/restaurant/approach.png";
import contextImage from "../assets/case-studies/restaurant/context.png";
import outcomeImage from "../assets/case-studies/restaurant/outcome.png";

export const serviceAreaOrder = ["creative", "growth", "software"] as const;

export type ServiceArea = (typeof serviceAreaOrder)[number];

export const serviceAreaLabels: Record<ServiceArea, string> = {
  creative: "Creative",
  growth: "Growth",
  software: "Software",
};

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export type CaseStudyStepId = "context" | "approach" | "outcome";

export interface CaseStudyVisualItem {
  value: string;
  label: string;
}

export interface CaseStudyVisual {
  eyebrow: string;
  title: string;
  items: CaseStudyVisualItem[];
  image?: ImageMetadata;
  alt: string;
}

export interface CaseStudyStep {
  id: CaseStudyStepId;
  number: string;
  label: string;
  title: string;
  body: string[];
  tags: string[];
  visual: CaseStudyVisual;
}

export interface CaseStudy {
  slug: string;
  serviceArea: ServiceArea;
  year: string;
  client: string;
  industry: string;
  title: string;
  summary: string;
  catalogSummary: string;
  metrics: CaseStudyMetric[];
  steps: [CaseStudyStep, CaseStudyStep, CaseStudyStep];
  disclosure: string;
  seo: {
    title: string;
    description: string;
  };
}

export const caseStudyStepLabels: Record<CaseStudyStepId, string> = {
  context: "Context",
  approach: "Approach",
  outcome: "Outcome",
};

export function getCaseStudyHref(study: Pick<CaseStudy, "slug">): string {
  return `/work/${study.slug}/`;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "restaurant-chain-growth",
    serviceArea: "growth",
    year: "2026",
    client: "Confidential U.S. restaurant chain",
    industry: "Restaurants & Hospitality",
    title: "More traffic. More orders. Lower cost.",
    summary:
      "A plant based restaurant chain needed its paid channels to work as one growth engine, not a pile of disconnected campaigns.",
    catalogSummary:
      "Search, social, and display were rebuilt into a faster testing loop for a restaurant chain that needed more paid orders at better efficiency.",
    metrics: [
      { value: "+83%", label: "web traffic vs. prior year" },
      { value: "3.3×", label: "paid cart sessions vs. baseline" },
    ],
    steps: [
      {
        id: "context",
        number: "01",
        label: "Context",
        title: "Demand was there. The channel mix was not compounding.",
        body: [
          "The chain wanted more traffic and more paid orders at better efficiency. Search, social, and display each needed a clear role and a faster feedback loop.",
        ],
        tags: ["Multi location", "Paid acquisition", "Digital ordering"],
        visual: {
          eyebrow: "Starting point",
          title: "Disconnected demand signals",
          items: [
            { value: "3", label: "paid channels" },
            { value: "50%", label: "budget increase" },
          ],
          image: contextImage,
          alt:
            "Illustrated restaurant locations and customers connected through fragmented digital marketing paths.",
        },
      },
      {
        id: "approach",
        number: "02",
        label: "Approach",
        title: "Test the mix, then move budget toward what worked.",
        body: [
          "We tested channel allocation, creative, copy, and keywords, then moved budget toward what worked. Search expanded into unbranded and competitor terms.",
        ],
        tags: ["Channel mix", "Creative testing", "Search strategy"],
        visual: {
          eyebrow: "Operating loop",
          title: "Budget followed the strongest signals",
          items: [
            { value: "10", label: "weeks of optimization" },
            { value: "3", label: "search paths expanded" },
          ],
          image: approachImage,
          alt:
            "Illustrated team testing campaign assets and combining channels into a focused restaurant growth system.",
        },
      },
      {
        id: "outcome",
        number: "03",
        label: "Outcome",
        title: "Traffic rose 83%. Paid cart sessions reached 3.3× baseline.",
        body: [
          "Average CPC fell from $0.95 in week one to $0.40 by week ten. Unbranded traffic rose 27% with CPC down 10%. Competitor traffic rose 18% with CPC down 31%.",
        ],
        tags: ["83% traffic growth", "3.3× cart sessions", "58% lower CPC"],
        visual: {
          eyebrow: "Movement",
          title: "More orders at lower cost",
          items: [
            { value: "+83%", label: "traffic" },
            { value: "3.3×", label: "cart sessions" },
            { value: "$0.40", label: "week ten CPC" },
          ],
          image: outcomeImage,
          alt:
            "Illustrated restaurant network turning a growing digital audience into more orders at lower cost.",
        },
      },
    ],
    disclosure:
      "Results are directional to protect client confidentiality. Media budget increased 50% versus the baseline period.",
    seo: {
      title: "Restaurant chain paid media case study",
      description:
        "How a restaurant chain grew traffic 83% and paid cart sessions 3.3x by rebuilding search, social, and display into one growth loop.",
    },
  },
  {
    slug: "retail-loyalty-email-growth",
    serviceArea: "growth",
    year: "2026",
    client: "Confidential specialty retailer",
    industry: "Retail & Loyalty",
    title: "More members. More engagement. One connected program.",
    summary:
      "A specialty retailer with 35 locations needed loyalty and email to work as one growth engine across online and retail.",
    catalogSummary:
      "A fragmented loyalty program became a connected owned-channel engine across ecommerce and 35 stores.",
    metrics: [
      { value: "350k", label: "members reached" },
      { value: ">40%", label: "email open rates" },
      { value: "~4%", label: "click-through rate" },
    ],
    steps: [
      {
        id: "context",
        number: "01",
        label: "Context",
        title: "The audience was there. The experience was fragmented.",
        body: [
          "Online and in-store loyalty operated differently. The program was complicated, customer benefits were unclear, and restrictive marketing rules limited the ability to rely on paid channels.",
        ],
        tags: ["35 locations", "Loyalty", "Owned channels"],
        visual: {
          eyebrow: "Fragmented base",
          title: "One customer program split across channels",
          items: [
            { value: "35", label: "retail locations" },
            { value: "2", label: "loyalty paths" },
          ],
          alt:
            "Abstract loyalty map showing ecommerce and retail locations before program consolidation.",
        },
      },
      {
        id: "approach",
        number: "02",
        label: "Approach",
        title: "Simplify the program, then build an owned channel around it.",
        body: [
          "We connected loyalty across ecommerce and 35 retail locations, simplified the program, and introduced sign-up offers and member-only benefits.",
          "Email became the primary communication channel. Frequency increased to two to three emails per week, supported by a stronger mix of content, product stories, and offers.",
        ],
        tags: ["Email cadence", "Member benefits", "Program simplification"],
        visual: {
          eyebrow: "Owned loop",
          title: "Benefits, content, and offers in one cadence",
          items: [
            { value: "2-3", label: "emails per week" },
            { value: "1", label: "connected program" },
          ],
          alt:
            "Branded editorial diagram showing loyalty benefits feeding recurring email engagement.",
        },
      },
      {
        id: "outcome",
        number: "03",
        label: "Outcome",
        title: "Membership reached 350,000. Email open rates exceeded 40%.",
        body: [
          "Click-through rates reached approximately 4%. The business built a direct, engaged customer audience and a scalable owned channel in a highly restrictive marketing environment.",
        ],
        tags: ["350k members", ">40% open rates", "~4% click-through"],
        visual: {
          eyebrow: "Owned audience",
          title: "Scale without paid-channel dependence",
          items: [
            { value: "350k", label: "members" },
            { value: ">40%", label: "opens" },
            { value: "~4%", label: "CTR" },
          ],
          alt:
            "Data-forward loyalty visual showing member growth and email engagement outcomes.",
        },
      },
    ],
    disclosure:
      "Results are directional to protect client confidentiality. Client and identifying details are intentionally withheld.",
    seo: {
      title: "Retail loyalty and email growth case study",
      description:
        "How a specialty retailer connected loyalty and email across 35 locations, reaching 350,000 members and email open rates above 40%.",
    },
  },
  {
    slug: "medical-office-demand-growth",
    serviceArea: "software",
    year: "2021",
    client: "Confidential X-Ray & Ultrasound clinic",
    industry: "Medical Offices",
    title: "A medical office grew traffic 3.3× during lockdown.",
    summary:
      "A clinic needed more sales during a COVID-related lockdown, so the website and campaigns were rebuilt around lead generation.",
    catalogSummary:
      "A medical clinic used a rebuilt site, SEO, and three ten-day channel pilots to create record monthly sales during difficult market conditions.",
    metrics: [
      { value: "3.3×", label: "web traffic growth" },
      { value: "3", label: "ten-day pilots" },
      { value: "Record", label: "monthly sales performance" },
    ],
    steps: [
      {
        id: "context",
        number: "01",
        label: "Context",
        title: "Demand needed to move through a better digital front door.",
        body: [
          "We were engaged to help a medical clinic in a major North American city grow sales in the middle of a COVID-related lockdown.",
          "The client needed a stronger way to turn search and campaign traffic into qualified demand while operating through lockdown restrictions and volatile winter weather.",
        ],
        tags: ["Medical office", "Lead generation", "Lockdown conditions"],
        visual: {
          eyebrow: "Constraint",
          title: "Demand under restricted operating conditions",
          items: [
            { value: "1", label: "clinic" },
            { value: "COVID", label: "lockdown market" },
          ],
          alt:
            "Editorial medical-office visual showing constrained demand flowing into a digital intake path.",
        },
      },
      {
        id: "approach",
        number: "02",
        label: "Approach",
        title: "Rebuild the site, then test the channel mix in short cycles.",
        body: [
          "The website was redesigned from the ground up to emphasize user experience, SEO content, clear calls to action, client reviews, security, and mobile friendliness.",
          "Three $500 ten-day pilots tested budget size, channel allocation, and creative assets across display, social, and search.",
        ],
        tags: ["Website rebuild", "SEO", "Paid channel pilots"],
        visual: {
          eyebrow: "Build and test",
          title: "A conversion site plus three controlled pilots",
          items: [
            { value: "$500", label: "per test" },
            { value: "10", label: "days each" },
            { value: "3", label: "channels" },
          ],
          alt:
            "Branded diagram showing website conversion improvements and three paid-media pilot tests.",
        },
      },
      {
        id: "outcome",
        number: "03",
        label: "Outcome",
        title: "Web traffic grew 3.3× and sales performance reached records.",
        body: [
          "Website traffic grew by over 3.3×, leading the client to expand operational capacity to meet elevated customer demand.",
          "Continuous CPC reduction helped grow traffic without needing to increase the ad spend budget.",
        ],
        tags: ["3.3× traffic growth", "Record monthly sales", "Lower CPC"],
        visual: {
          eyebrow: "Result",
          title: "More demand without more media pressure",
          items: [
            { value: "3.3×", label: "traffic" },
            { value: "Record", label: "sales" },
            { value: "Lower", label: "average CPC" },
          ],
          alt:
            "Data visual showing medical-office traffic growth and improved paid-media efficiency.",
        },
      },
    ],
    disclosure:
      "Results are directional to protect client confidentiality. Logos and identifying details were redacted in the original source material.",
    seo: {
      title: "Medical office website and paid media case study",
      description:
        "How a medical clinic grew web traffic 3.3x and reached record sales performance through a lead-generation website and paid media pilots.",
    },
  },
  {
    slug: "real-estate-lead-generation",
    serviceArea: "growth",
    year: "2021",
    client: "Confidential real estate firm",
    industry: "Real Estate Lead Generation",
    title: "230+ leads in 10 days after prior campaigns stalled.",
    summary:
      "A real estate firm needed leads for a pre-construction project with only ten days before a grand open house.",
    catalogSummary:
      "A landing page built in 48 hours and a rapidly optimized paid campaign generated more than 230 leads in ten days.",
    metrics: [
      { value: "230+", label: "leads in 10 days" },
      { value: "48h", label: "landing page build" },
      { value: "4.6×", label: "industry conversion benchmark" },
    ],
    steps: [
      {
        id: "context",
        number: "01",
        label: "Context",
        title: "The deadline was fixed and previous lead volume was too low.",
        body: [
          "We were engaged to help a prominent real estate firm drive leads for a pre-construction project with ten days until the grand open house event.",
          "The previous digital marketing firm had driven fewer than 100 leads in more than a month.",
        ],
        tags: ["Pre-construction", "Compressed timeline", "Lead volume"],
        visual: {
          eyebrow: "Pressure",
          title: "Ten days to beat a month of prior work",
          items: [
            { value: "10", label: "days" },
            { value: "<100", label: "prior-month leads" },
          ],
          alt:
            "Timeline visual showing a compressed real-estate launch window and prior low lead volume.",
        },
      },
      {
        id: "approach",
        number: "02",
        label: "Approach",
        title: "Launch the landing page fast, then optimize spend every day.",
        body: [
          "A landing page was built in 48 hours with fast client feedback and iterations, using effective imagery and a highly visible call to action to increase conversion.",
          "The campaign was launched with rapid testing of creative assets and copy, plus continuous optimization of ad spend and channel allocation across display, social, and search.",
        ],
        tags: ["Landing page", "Creative testing", "Spend allocation"],
        visual: {
          eyebrow: "Launch system",
          title: "Fast page build plus daily media decisions",
          items: [
            { value: "48h", label: "page build" },
            { value: "3", label: "ad channels" },
          ],
          alt:
            "Branded diagram showing a landing page connected to display, social, and search optimization.",
        },
      },
      {
        id: "outcome",
        number: "03",
        label: "Outcome",
        title: "The campaign produced 230+ leads in ten days.",
        body: [
          "The campaign generated more than 230 leads in ten days, with ongoing spend allocation shifting toward the channels producing the strongest response.",
          "Conversion performance carried into subsequent campaigns, rising to more than 4.6× the cited industry benchmark.",
        ],
        tags: ["230+ leads", "10-day campaign", "4.6× benchmark"],
        visual: {
          eyebrow: "Lead flow",
          title: "A short campaign with compounding conversion learning",
          items: [
            { value: "230+", label: "leads" },
            { value: "13.43%", label: "third campaign conversion" },
            { value: "4.6×", label: "benchmark" },
          ],
          alt:
            "Data visual showing real-estate lead growth and conversion performance above benchmark.",
        },
      },
    ],
    disclosure:
      "Results are directional to protect client confidentiality. Identifying details were redacted in the original source material.",
    seo: {
      title: "Real estate lead generation case study",
      description:
        "How a real estate firm generated 230+ leads in ten days with a 48-hour landing page and rapid paid media optimization.",
    },
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getAdjacentCaseStudies(slug: string): {
  previous?: CaseStudy;
  next?: CaseStudy;
} {
  const index = caseStudies.findIndex((study) => study.slug === slug);
  if (index < 0) return {};
  return {
    previous: index > 0 ? caseStudies[index - 1] : undefined,
    next: index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined,
  };
}
