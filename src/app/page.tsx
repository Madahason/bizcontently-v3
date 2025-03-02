import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Reclaim Your Time and{" "}
          <span className="text-purple-600">Transform Your Reach</span> with
          <div className="mt-2">BizContently</div>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          All-in-one AI-powered content creation and distribution—so you can
          focus on what matters most: growing your business.
        </p>
        <p className="mt-4 text-lg text-gray-500">
          Say goodbye to content overwhelm—hello to effortless growth.
        </p>
        <Link
          href="/auth"
          className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium flex items-center mx-auto w-fit"
        >
          Get started for free →
        </Link>
      </div>

      {/* Why Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-4xl font-bold text-center mb-4">
          Why BizContently?
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16">
          Transform your content strategy with powerful AI-driven solutions
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Problem Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Problem</h3>
            <p className="text-gray-600 mb-4">
              Wasted hours on manual keyword research and scattered tools.
            </p>
            <h3 className="font-semibold text-purple-600 mb-2">Solution</h3>
            <p className="text-gray-600">
              Our AI-powered platform centralizes everything, giving you
              real-time keyword insights at the click of a button.
            </p>
          </div>

          {/* Problem Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Problem</h3>
            <p className="text-gray-600 mb-4">
              Struggling to create engaging content that actually drives
              traffic.
            </p>
            <h3 className="font-semibold text-purple-600 mb-2">Solution</h3>
            <p className="text-gray-600">
              Automatically generate high-quality blog posts, reels, and video
              scripts designed to rank and resonate.
            </p>
          </div>

          {/* Problem Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Problem</h3>
            <p className="text-gray-600 mb-4">
              No time or energy left to manage multi-platform publishing.
            </p>
            <h3 className="font-semibold text-purple-600 mb-2">Solution</h3>
            <p className="text-gray-600">
              Seamlessly publish across WordPress, Medium, YouTube, and more
              with just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything You Need to Supercharge Your Content Strategy
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Powerful features designed to help you create, manage, and
            distribute content effortlessly
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Effortless Blog Posts That Pass AI Detection
              </h3>
              <p className="text-gray-600">
                Generate outlines, finalize sections, and automatically add
                AI-created images that wow your readers—without the dreaded
                'robotic' feel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Viral Video Insights at Your Fingertips
              </h3>
              <p className="text-gray-600">
                Identify trending videos across platforms, extract key insights,
                and generate fresh scripts for short-form or long-form content.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Publish Everywhere in One Click
              </h3>
              <p className="text-gray-600">
                Push your content to WordPress, Medium, Instagram, and more—all
                from a single dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Stay Organized & In Control
              </h3>
              <p className="text-gray-600">
                Easily manage all your generated content, media assets, and user
                preferences to keep your workflow smooth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that best fits your needs
          </p>
          {/* Add pricing cards here if needed */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Be among the first to access BizContently and experience
            streamlined, AI-powered content creation. Get notified when we
            launch!
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors font-medium"
          >
            Get started for free →
          </Link>
          <p className="text-purple-200 mt-4 text-sm">
            Limited spots available • No credit card required
          </p>
        </div>
      </section>
    </main>
  );
}
