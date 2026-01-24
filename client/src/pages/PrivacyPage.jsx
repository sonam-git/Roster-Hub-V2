import { Link } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt, FaLock, FaDatabase, FaUserShield } from "react-icons/fa";

const PrivacyPolicy = () => {
  const lastUpdated = "January 21, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4">
            <FaShieldAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-oswald font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to RosterHub. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              platform and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaDatabase className="text-blue-600 dark:text-blue-400" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Name and contact information (email address)</li>
                  <li>Profile information (profile picture, position, jersey number)</li>
                  <li>Organization and team membership details</li>
                  <li>Game participation and availability data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Log data and device information</li>
                  <li>Interaction with platform features</li>
                  <li>Communication and messages within the platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>We use your personal information to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Provide and maintain our team management services</li>
                <li>Enable team communication and collaboration</li>
                <li>Send notifications about games and team activities</li>
                <li>Improve and personalize your experience</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaLock className="text-blue-600 dark:text-blue-400" />
              Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal 
              data against unauthorized or unlawful processing, accidental loss, destruction, or damage. All 
              data transmissions are encrypted using SSL/TLS protocols, and we regularly review our security 
              procedures to ensure your data remains protected.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">5.</span>
              Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Team Members:</strong> Within your organization to facilitate team management</li>
                <li><strong>Service Providers:</strong> Third parties who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaUserShield className="text-blue-600 dark:text-blue-400" />
              Your Rights
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:sherpa.sjs@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  sherpa.sjs@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">7.</span>
              Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in 
              this privacy policy, unless a longer retention period is required by law. When you delete your 
              account, we will delete or anonymize your personal data within 30 days.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">8.</span>
              Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              RosterHub is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe we 
              have collected information from your child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">9.</span>
              Changes to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last Updated" date. We encourage 
              you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy;
