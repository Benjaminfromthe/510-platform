# 510-platform

## Overview

510-platform is a Next.js 14 application built with TypeScript and styled using Tailwind CSS. This project is structured to facilitate the development of a modern web application with a focus on modularity and reusability.

## Project Structure

```
510-platform
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api
│   ├── components
│   │   ├── common
│   │   └── ui
│   ├── lib
│   │   └── utils.ts
│   ├── hooks
│   ├── types
│   └── styles
├── public
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd 510-platform
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Install the required packages:
   ```
   npm install prisma @prisma/client @clerk/nextjs shadcn-ui lucide-react zod
   ```

## Usage

To run the development server, use the following command:

```
npm run dev
```

This will start the Next.js application in development mode. You can view it in your browser at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.