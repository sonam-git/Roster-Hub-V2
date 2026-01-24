import { Link } from "react-router-dom";
import { FaArrowLeft, FaFileContract, FaCheckCircle, FaBan, FaExclamationTriangle } from "react-icons/fa";

const TermsOfService = () => {
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
            <FaFileContract className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-oswald font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700 space-y-8">
          
          {/* Agreement to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">1.</span>
              Agreement to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing or using RosterHub ("the Service"), you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any part of these terms, you 
              may not use our Service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaCheckCircle className="text-green-600 dark:text-green-400" />
              Use License
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Permission is granted to temporarily use RosterHub for team management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Modify or copy the Service materials</li>
                <li>Use the materials for any commercial purpose or public display</li>
                <li>Attempt to reverse engineer any software contained in RosterHub</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">3.</span>
              User Accounts
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your profile information is accurate and up-to-date</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">4.</span>
              Acceptable Use Policy
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>You agree not to use RosterHub for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited activities include:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Harassing, threatening, or defaming other users</li>
                <li>Uploading malicious code or viruses</li>
                <li>Attempting to gain unauthorized access to the Service</li>
                <li>Impersonating any person or entity</li>
                <li>Collecting or storing personal data about other users without consent</li>
                <li>Using automated systems to access the Service without permission</li>
              </ul>
            </div>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">5.</span>
              Content Ownership and Rights
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p><strong>Your Content:</strong> You retain ownership of any content you submit to RosterHub. By submitting content, you grant us a license to use, display, and distribute that content as necessary to provide the Service.</p>
              <p><strong>Our Content:</strong> All Service materials, including text, graphics, logos, and software, are the property of RosterHub and protected by copyright laws.</p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaBan className="text-red-600 dark:text-red-400" />
              Termination
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.</p>
              <p>Upon termination, your right to use the Service will immediately cease. You may also terminate your account at any time by contacting us.</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">7.</span>
              Disclaimer
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="uppercase font-semibold">The service is provided "as is" without warranties of any kind, either express or implied.</p>
              <p>RosterHub does not warrant that:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Service is free of viruses or harmful components</li>
                <li>Results obtained from the Service will be accurate or reliable</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />
              Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In no event shall RosterHub or its developers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising out 
              of the use or inability to use the Service, even if RosterHub has been notified orally or in 
              writing of the possibility of such damage.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">9.</span>
              Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. We will provide notice of significant 
              changes by posting the new terms on this page and updating the "Last Updated" date. Your 
              continued use of the Service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">10.</span>
              Governing Law
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without 
              regard to its conflict of law provisions. Any disputes arising from these terms or the Service 
              shall be resolved through binding arbitration or in the courts having jurisdiction.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;
