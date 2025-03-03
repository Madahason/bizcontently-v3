# Ansh & Riley Full-Stack Template

This is a full-stack template project for Software Composers to create applications with AI.

## Getting started

To create a new project, you go to `/paths`, choose from our list of Paths, and then use Cursor's Composer feature to quickly scaffold your project!

You can also edit the Path's prompt template to be whatever you like!

## Technologies used

This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies

- React with Next.js 14 App Router
- TailwindCSS
- Firebase Auth, Storage, and Database
- Multiple AI endpoints including OpenAI, Anthropic, and Replicate using Vercel's AI SDK

## Environment Variables Setup

The application requires several API keys and configuration values to function properly. Follow these steps to set up your environment:

1. Copy `.env.example` to create your own `.env` file:

```bash
cp .env.example .env
```

2. Obtain the necessary API keys:

### AI Services

- **Anthropic API Key** (Required)
  - Sign up at [Anthropic Console](https://console.anthropic.com/)
  - Used for generating blog topics and content
- **OpenAI API Key** (Optional)
  - Get from [OpenAI Platform](https://platform.openai.com/)
  - Alternative AI provider for content generation

### Search and SEO Tools

- **SerpApi Key** (Required for SERP features)
  - Sign up at [SerpApi](https://serpapi.com/)
  - Used for real-time search engine data
- **Google Search API** (Alternative to SerpApi)
  1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Custom Search API
  3. Create API credentials (API Key)
  4. Set up API Key restrictions:
     - Open the API key settings
     - Under "Application restrictions":
       - Select "HTTP referrers (websites)"
       - Add your domain(s) and localhost for development:
         ```
         http://localhost:3000/*
         https://your-production-domain.com/*
         ```
     - Under "API restrictions":
       - Select "Restrict key"
       - Choose "Custom Search API" from the dropdown
     - Set optional quota limits:
       - Set daily quota to manage costs
       - Configure alerts for quota usage
  5. Create a [Programmable Search Engine](https://programmablesearchengine.google.com/)
     - Configure search settings:
       - Select sites to search (or search the entire web)
       - Enable image search if needed
       - Configure SafeSearch settings
     - Get your Search Engine ID
  6. Add to your .env:
     ```
     GOOGLE_SEARCH_API_KEY=your_api_key
     GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
     ```

### Media Services

- **Replicate API Key** (Optional)
  - Get from [Replicate](https://replicate.com/)
  - Used for image generation
- **Deepgram API Key** (Optional)
  - Sign up at [Deepgram Console](https://console.deepgram.com/)
  - Used for audio transcription

### Firebase Configuration

For Firebase setup:

1. Create a new project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Get your Web App configuration
4. Fill in the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Security Notes

1. Never commit your `.env` file to version control
2. Keep your API keys secure and rotate them regularly
3. Use appropriate API key restrictions where possible
4. Monitor API usage to prevent unexpected costs

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- AI-powered blog topic generation
- Real-time SERP data integration
- SEO insights and competitor analysis
- Content outline generation
- Firebase authentication and storage
- Audio transcription
- Image generation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Security Best Practices

### API Key Security

1. **Google Search API**

   - Always use API key restrictions
   - Set appropriate quotas
   - Use environment variables
   - Monitor usage in Google Cloud Console
   - Rotate keys periodically
   - Use separate keys for development and production

2. **Request Caching**

   - Search results are cached for 24 hours
   - Cache is automatically cleared when expired
   - Reduces API usage and costs
   - Improves response times

3. **Error Handling**
   - All API errors are logged
   - Fallback mechanisms in place
   - Graceful degradation when services are unavailable
