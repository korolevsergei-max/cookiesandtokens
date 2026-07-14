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

export interface CaseStudyStep {
  id: "context" | "approach" | "outcome";
  number: string;
  label: string;
  title: string;
  body: string;
  tags: string[];
  image: ImageMetadata;
  alt: string;
}

export interface CaseStudy {
  slug: string;
  serviceArea: ServiceArea;
  client: string;
  industry: string;
  title: string;
  summary: string;
  metrics: CaseStudyMetric[];
  steps: [CaseStudyStep, CaseStudyStep, CaseStudyStep];
  disclosure: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "restaurant-chain-growth",
    serviceArea: "growth",
    client: "Confidential U.S. restaurant chain",
    industry: "Restaurants & Hospitality",
    title: "More traffic. More orders. Lower cost.",
    summary:
      "A highly regarded plant-based restaurant chain needed its paid channels to work as one growth engine, not a collection of disconnected campaigns.",
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
        body:
          "The chain wanted to grow web traffic and paid order sessions while improving efficiency across search, social, and display. Each channel needed a clearer role and a faster feedback loop.",
        tags: ["Multi-location", "Paid acquisition", "Digital ordering"],
        image: contextImage,
        alt:
          "Illustrated restaurant locations and customers connected through fragmented digital marketing paths.",
      },
      {
        id: "approach",
        number: "02",
        label: "Approach",
        title: "Test the mix, then move budget toward what worked.",
        body:
          "We rapidly tested channel allocation, ad creative, copy, calls to action, and keyword strategy. Social and display assets were iterated repeatedly while search expanded into relevant unbranded and competitor terms.",
        tags: ["Channel mix", "Creative testing", "Search strategy"],
        image: approachImage,
        alt:
          "Illustrated team testing campaign assets and combining channels into a focused restaurant growth system.",
      },
      {
        id: "outcome",
        number: "03",
        label: "Outcome",
        title: "Traffic rose 83%. Paid cart sessions reached 3.3× baseline.",
        body:
          "Average CPC fell from $0.95 in week one to $0.40 by week ten. Unbranded keyword traffic rose 27% with CPC down 10%; competitor keyword traffic rose 18% with CPC down 31%.",
        tags: ["83% traffic growth", "3.3× cart sessions", "58% lower CPC"],
        image: outcomeImage,
        alt:
          "Illustrated restaurant network turning a growing digital audience into more orders at lower cost.",
      },
    ],
    disclosure:
      "Results are directional to protect client confidentiality. Media budget increased 50% versus the baseline period.",
  },
];
