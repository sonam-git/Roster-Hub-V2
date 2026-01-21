import { Link } from "react-router-dom";
import { FaArrowLeft, FaQuestionCircle, FaEnvelope, FaBook } from "react-icons/fa";

const HelpCenter = () => {
  const helpTopics = [
    {
      id: 1,
      icon: "🎯",
      title: "Getting Started",
      description: "Learn the basics of RosterHub and set up your team",
      articles: [
        "Creating your first organization",
        "Inviting team members",
        "Setting up player profiles",
        "Understanding the dashboard"
      ]
    },
    {
      id: 2,
      icon: "⚽",
      title: "Game Management",
      description: "Create, schedule, and manage your games effectively",
      articles: [
        "Creating a new game",
        "Managing player availability",
        "Setting up formations",
        "Game feedback and ratings"
      ]
    },
    {
      id: 3,
      icon: "👥",
      title: "Team Roster",
      description: "Organize and manage your team members",
      articles: [
        "Adding players to roster",
        "Assigning positions and jersey numbers",
        "Viewing player profiles",
        "Removing team members"
      ]
    },
    {
      id: 4,
      icon: "💬",
      title: "Communication",
      description: "Stay connected with your team",
      articles: [
        "Using the messaging system",
        "Team announcements",
        "Game notifications",
        "Email invitations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <FaQuestionCircle className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-oswald font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to your questions and learn how to make the most of RosterHub
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-6 py-4 pr-12 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {helpTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{topic.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {topic.description}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {topic.articles.map((article, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      → {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg mb-6 opacity-90">
            Our support team is here to assist you with any questions or issues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:sherpa.sjs@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaEnvelope /> Contact Support
            </a>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              <FaBook /> View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
