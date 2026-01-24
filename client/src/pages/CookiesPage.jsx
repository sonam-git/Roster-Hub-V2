import { Link } from "react-router-dom";
import { FaArrowLeft, FaCookie, FaToggleOn, FaToggleOff } from "react-icons/fa";

const CookiePolicy = () => {
  const lastUpdated = "January 21, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-4">
            <FaCookie className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-oswald font-bold text-gray-900 dark:text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
          
          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              What Are Cookies?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They 
              are widely used to make websites work more efficiently and provide information to website owners. 
              Cookies help us understand how you interact with RosterHub and improve your experience.
            </p>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">2.</span>
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3 mb-3">
                  <FaToggleOn className="text-2xl text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Essential Cookies (Always Active)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      These cookies are necessary for the website to function and cannot be disabled in our systems.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                      <li>Authentication tokens to keep you logged in</li>
                      <li>Security cookies to protect your account</li>
                      <li>Session management cookies</li>
                      <li>CSRF protection tokens</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3 mb-3">
                  <FaToggleOn className="text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Functional Cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      These cookies enable enhanced functionality and personalization.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                      <li>Theme preferences (dark/light mode)</li>
                      <li>Language settings</li>
                      <li>Organization selection preferences</li>
                      <li>User interface customizations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3 mb-3">
                  <FaToggleOff className="text-2xl text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Performance Cookies (Optional)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                      <li>Analytics about page visits and usage patterns</li>
                      <li>Error tracking and debugging information</li>
                      <li>Performance metrics and load times</li>
                      <li>Feature usage statistics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              How We Use Cookies
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>We use cookies to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use RosterHub</li>
                <li>Improve website performance and user experience</li>
                <li>Protect against fraud and unauthorized access</li>
                <li>Provide personalized features and content</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">4.</span>
              Third-Party Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We may allow trusted third-party services to place cookies on your device for the following purposes:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Analytics Services:</strong> To help us understand how users interact with our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Authentication Providers:</strong> For secure login and account management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Content Delivery Networks:</strong> To improve website performance and speed</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">5.</span>
              Managing Your Cookie Preferences
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie 
                preferences by:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Browser Settings</h4>
                <p className="text-sm mb-3">
                  Most web browsers automatically accept cookies, but you can modify your browser settings to 
                  decline cookies if you prefer. Here's how:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm pl-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Privacy and Services → Cookies</li>
                </ul>
                <p className="text-sm mt-3 text-yellow-700 dark:text-yellow-400">
                  ⚠️ Note: Disabling essential cookies may affect the functionality of RosterHub.
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Duration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">6.</span>
              Cookie Duration
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser.</p>
              <p><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them. We use persistent cookies to remember your preferences and keep you logged in.</p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">7.</span>
              Updates to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, 
              or our business operations. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p><strong>Email:</strong> <a href="mailto:sherpa.sjs@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">sherpa.sjs@gmail.com</a></p>
              <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/sonamjsherpa/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Sonam J Sherpa</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
