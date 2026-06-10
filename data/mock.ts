import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  Clock3,
  Layers3,
  MessageSquareText,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" }
];

export const heroStats = [
  {
    title: "Performance",
    value: "89%",
    detail: "Average improvement after 5 sessions",
    icon: Trophy
  },
  {
    title: "Feedback",
    value: "Instant",
    detail: "Tone, clarity, and confidence insights",
    icon: MessageSquareText
  },
  {
    title: "Analytics",
    value: "Live",
    detail: "Track progress across every mock round",
    icon: BarChart3
  }
];

export const features: Feature[] = [
  {
    title: "AI Generated Questions",
    description:
      "Role-aware mock questions structured to feel realistic, challenging, and interview-ready.",
    icon: BrainCircuit,
    accent: "from-violet-500/25 to-fuchsia-500/20"
  },
  {
    title: "Real-time Feedback",
    description:
      "Surface clarity, delivery, and answer quality with premium coaching-style insights.",
    icon: MessageSquareText,
    accent: "from-cyan-500/25 to-blue-500/20"
  },
  {
    title: "Performance Analytics",
    description:
      "Transform each session into measurable growth with focused skill trend indicators.",
    icon: BarChart3,
    accent: "from-amber-500/25 to-orange-500/20"
  },
  {
    title: "Adaptive Difficulty",
    description:
      "Progress from warm-up rounds to tougher scenarios as your confidence and accuracy improve.",
    icon: Target,
    accent: "from-indigo-500/25 to-sky-500/20"
  }
];

export const setupOptions = {
  roles: [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Engineer",
    "Product Manager",
    "Data Analyst"
  ],
  experienceLevels: ["0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"],
  interviewTypes: ["Technical", "Behavioral", "System Design", "HR Round"],
  questionCounts: ["3 Questions", "5 Questions", "7 Questions", "10 Questions"]
};

export const setupHighlights = [
  {
    icon: Sparkles,
    title: "Resume-driven personalization",
    description: "We tailor mock prompts to the tools, projects, and experience you want to showcase."
  },
  {
    icon: Clock3,
    title: "Focused practice flow",
    description: "Pick the role, round style, and question count that matches your next real interview."
  },
  {
    icon: Layers3,
    title: "Premium structure",
    description: "Reusable UI foundations now make it easy to grow into dashboards, reports, and coding rounds."
  }
];
