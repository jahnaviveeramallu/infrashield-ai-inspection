# InfraShield AI

InfraShield AI is a modern civic and campus infrastructure reporting platform designed to streamline issue tracking, repair updates, and municipal accountability. Built with **Next.js** and **Firebase**, the platform empowers both citizens to report problems and municipal officials or campus administrators to manage and resolve them efficiently.

---

## 🛑 Problem Statement
Urban and campus infrastructure management often suffers from fragmented communication channels between citizens and local authorities. Traditional grievance-redressal mechanisms are plagued by:
* Lack of transparent tracking for reported issues (e.g., potholes, broken streetlights, waste overflow).
* Delays in manual sorting and routing of complaints to the appropriate municipal departments.
* Reduced civic engagement due to cumbersome reporting interfaces and zero visibility into repair progress.

## 💡 Proposed Solution
InfraShield AI bridges this gap by providing an end-to-end digital infrastructure reporting ecosystem:
* **Instant Incident Logging:** Citizens can rapidly submit issues with description, location metadata, and visual proof through a streamlined web interface.
* **Streamlined Official Workflows:** Municipal officers receive, categorize, and update ticket statuses (Pending, In Progress, Resolved) dynamically via a centralized management dashboard.
* **Real-Time Accountability:** Both parties maintain clear visibility into repair lifecycles, ensuring transparency and timely resolution.

## ✨ What Makes It Unique
* **Role-Based Tailored Experiences:** Distinct, optimized workflows customized specifically for everyday citizens reporting problems versus municipal officers managing repairs.
* **Instant Evaluator Access:** Built-in **Quick Login (For Judges)** feature enabling immediate one-click testing of both citizen and officer views without manual sign-up overhead.
* **Modern High-Performance Stack:** Crafted with Next.js, TypeScript, Tailwind CSS, and Framer Motion to deliver snappy transitions, responsive layouts, and seamless Firebase authentication.

---

## 📖 How to Use the Website

### 1. Accessing the Platform
* Open the application in your browser to land on the authentication page.
* You can register a new account using the **Create Account** toggle, sign in with email and password, or use the **Quick Login (For Judges)** panel for instant demo access.

### 2. Citizen Workflow (Reporting Issues)
* Select **Citizen View** from the Quick Login box or log in with a citizen account.
* You will be redirected to the issue reporting interface (`/report`).
* Complete the issue details, add necessary visuals, and submit your grievance to track ongoing repairs in your neighborhood.

### 3. Official Workflow (Managing Repairs)
* Select **Officer View** from the Quick Login box or log in using an official municipal email handle.
* You will be redirected to the municipal dashboard (`/dashboard`).
* Review incoming citizen reports, modify ticket statuses (such as Pending, In Progress, or Resolved), and monitor regional performance metrics.

---

## 🛠️ Tech Stack

* **Frontend & Framework:** Next.js (React), TypeScript
* **Styling & Animations:** Tailwind CSS, Lucide Icons, Framer Motion
* **Backend & Auth:** Firebase Auth
* **State Management:** React Context API , Gemini 3.5 flash API

## 🏁 Getting Started for Local Development

### Prerequisites
Ensure you have Node.js installed on your machine.

### Installation Steps

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/infrashield-ai.git](https://github.com/your-username/infrashield-ai.git)
   cd infrashield-ai
Install dependencies:

Bash
npm install
Set up environment variables:
Create a .env.local file in the root directory and configure your Firebase credentials:

Code snippet
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
Run the development server:

Bash
npm run dev
