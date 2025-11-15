import {BookOpen, Heart, ShieldCheck, Sparkles} from "lucide-react";

export const APP_NAME = "Mentora";

export const HERO_CONTENT = {
  badgeText: "AI guidance inspired by timeless wisdom",
  title: "Gentle support for your mind and heart",
  highlight: "mind and heart",
  description:
    "Mentora gives you a safe place to reflect and feel understood. It helps you clear your mind and find balance using wisdom that actually makes sense in real life.",
  stats: [
    {
      title: "5 free prompts / day",
      description:
        "Try Mentora without a card and see if the conversations help you.",
    },
    {
      title: "Judgement-free space",
      description:
        "Ask anything about stress, overthinking, purpose, or relationships.",
    },
    {
      title: "Always available",
      description: "Chat anytime you feel overwhelmed — Mentora is here 24/7.",
    },
  ],
};

export const FEATURES = [
  {
    icon: Heart,
    title: "Emotional support",
    description:
      "Talk about anxiety, low mood, overthinking, or burnout in a safe, private space.",
  },
  {
    icon: BookOpen,
    title: "Rooted in wisdom",
    description:
      "Answers are shaped by the teachings of the Bhagavad Gita, simplified for daily life.",
  },
  {
    icon: Sparkles,
    title: "AI-powered clarity",
    description:
      "Structured reflections, reframing, and gentle questions to help you think clearly.",
  },
  {
    icon: ShieldCheck,
    title: "Respectful boundaries",
    description:
      "Mentora does not replace professional care and encourages help when needed.",
  },
];

export const CTA_CONTENT = {
  title: "Ready to begin with Mentora?",
  description:
    "Start with 5 free prompts every day. No credit card required. Just a calm space to explore your thoughts with guidance grounded in timeless wisdom.",
  note: "You can upgrade anytime if Mentora feels right for you.",
};

export const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    highlight: false,
    description: "A simple plan to get you started.",
    features: [
      "5 prompts per day",
      "Basic chat access",
      "Regular response speed",
    ],
    buttonText: "Continue for Free",
    buttonVariant: "outline",
  },
  {
    name: "Basic",
    price: "₹349",
    period: "/month",
    highlight: true,
    description: "Best for people who want more clarity daily.",
    features: [
      "100 prompts per day",
      "Faster response speed",
      "Emotion-aware suggestions",
      "Priority uptime",
    ],
    buttonText: "Choose Basic",
    buttonVariant: "default",
  },
  {
    name: "Pro",
    price: "₹699",
    period: "/month",
    highlight: false,
    description: "Best for consistent daily self-improvement.",
    features: [
      "Unlimited prompts",
      "Fastest response speed",
      "Deep guidance mode",
      "Early access to new features",
      "Priority support",
    ],
    buttonText: "Go Pro",
    buttonVariant: "default",
  },
];
