<h1 align="center">Mentora</h1>

<p align="center">
An AI companion designed to support your mind and heart.
</p>

<p align=center>
  <img width="700px" alt="Mentora Tech Stack" src="./public/tech-stack.png">
</p>

<div align="center">

[![Twitter Badge](https://img.shields.io/badge/-@devwithjay-1ca0f1?style=social&labelColor=red&logo=x&logoColor=black&link=https://twitter.com/devwithjay)](https://twitter.com/devwithjay)&nbsp;&nbsp;
[![Linkedin Badge](https://img.shields.io/badge/@devwithjay-0e76a8)](https://www.linkedin.com/in/devwithjay/)&nbsp;&nbsp;
[![Mail Badge](https://img.shields.io/badge/-hello@devwithjay.com-c0392b?style=flat&labelColor=c0392b&logo=gmail&logoColor=pink)](mailto:hello@devwithjay.com)&nbsp;&nbsp;
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)&nbsp;&nbsp;
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

</div>

<h2 align="center">

<img src="./public/eyes-to-see.gif" width="26px" align="top"/> &nbsp;[See it in Action](https://mentora-ai.vercel.app) &nbsp;»

</h2>

<br>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a>
  ·&nbsp;<a href="#features"><strong>Features</strong></a>
  ·&nbsp;<a href="#tech-stack"><strong>Tech Stack</strong></a>
  ·&nbsp;<a href="#local-development"><strong>Development Setup</strong></a>
  ·&nbsp;<a href="#contributing"><strong>Contributing</strong></a>
</p>

<br>

## <a name="introduction">❄️&nbsp;Introduction</a>

Mentora gently guides you through stress, confusion, or emotional struggles using timeless wisdom from the Bhagavad-gītā.

Whether you're feeling low, overthinking, or simply need clarity, Mentora offers calm, meaningful, and practical guidance.

<br>

<p align=center>
  <img width="650px" alt="Mentora Preview" src="./public/mentora-preview.png">
</p>

<br>

## <a name="features">🔋&nbsp; Features</a>

- 💬 AI chat powered by Gita-based guidance

- 🔐 Secure login with OAuth and email authentication

- 📊 Daily usage tracking with fair limits and analytics

- 👤 Editable user profiles with personal details

- 💳 Subscription system with Razorpay integration

- 🛠️ Admin dashboard to manage users, issues, and plans

- 🗂️ Multiple conversations with renaming, deleting, and autosave

- ⚡ Real-time streaming replies for smoother chat

- 📱 Clean, responsive UI for all devices

- 🔔 Upgrade prompts when limits are reached

<br>

## <a name="tech-stack">⚙️ Tech Stack</a>

- [Next.js 16](https://nextjs.org) – React framework

- [Tailwind CSS](https://tailwindcss.com/) – Utility CSS

- [shadcn/ui](https://ui.shadcn.com/) – UI components

- [Aceternity UI](https://ui.aceternity.com/) – Extra components

- [TypeScript](https://www.typescriptlang.org/) – Typed JS

- [Zod](https://zod.dev/) – Schema validation

- [Drizzle ORM](https://orm.drizzle.team/) – SQL ORM

- [PostgreSQL](https://www.postgresql.org/) – Database

- [NextAuth](https://authjs.dev/) – Authentication

- [OpenAI API](https://platform.openai.com/) – AI models

- [Qdrant](https://qdrant.tech/) – Vector storage

- [Razorpay](https://razorpay.com/) – Payments

- [Vercel](https://vercel.com) – Deployment

<br>

## <a name="local-development"> 🖥️&nbsp;&nbsp; Local Development</a>

0. **Prerequisites** Ensure you have:
   - [Git](https://git-scm.com/)
   - [Node.js](https://nodejs.org/) (v20+)
   - [bun](https://bun.sh) or `npm` / `pnpm`
   - PostgreSQL (local or hosted)

1. **Clone the repository**

   ```bash
   git clone https://github.com/devwithjay/mentora.git
   ```

2. **Navigate into project**

   ```bash
   cd mentora
   ```

3. **Install dependencies**

   ```bash
   bun install
   ```

4. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:

   ```bash
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mentora"

   # AuthJS
   AUTH_SECRET='secret'
   AUTH_GITHUB_ID="Github client id"
   AUTH_GITHUB_SECRET="Github secret"
   AUTH_GOOGLE_ID="Google client id"
   AUTH_GOOGLE_SECRET="Google secret"

   # Logger
   LOG_LEVEL="info"

   # Razorpay
   RAZORPAY_KEY_ID=rzp_test_123
   RAZORPAY_KEY_SECRET=xyz123
   RAZORPAY_BASIC_PLAN_ID=plan_XXXXXX
   RAZORPAY_PRO_PLAN_ID=plan_YYYYYYY
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_123

   # OpenAI
   OPENAI_API_KEY=xyz12345

   # Qdrant
   QDRANT_URL=qdrant_url
   QDRANT_API_KEY=qdrant_api_key
   ```

5. **Push drizzle schema**

   ```bash
   bun run drizzle-kit push
   ```

6. **Start dev server**

   ```bash
   bun run dev
   ```

   Visit → http://localhost:3000

<br>

## <a name="contributing">🤝&nbsp;&nbsp;Contributing</a>

Contributions are always welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for ways to get started.

<br>

## 🪪&nbsp;&nbsp; License

Mentora is open-source under the [MIT License](./LICENSE).

Feel free to learn, build, and make it your own.
