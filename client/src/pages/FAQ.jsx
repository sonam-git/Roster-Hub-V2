import { Link } from "react-router-dom";
import { FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an organization?",
          a: "To create an organization, sign up for an account and navigate to the organization setup page. Enter your team name, and you'll receive a unique invite code to share with your team members."
        },
        {
          q: "How do I invite players to join my team?",
          a: "As an organization owner, you can invite players by sharing your unique invite code or by using the 'Send Email Invites' feature in the Admin Panel to send direct email invitations."
        },
        {
          q: "Can I join multiple organizations?",
          a: "Yes! You can switch between multiple organizations using the organization code, however you have to create an account for each organization."
        }
      ]
    },
    {
      category: "Game Management",
      questions: [
        {
          q: "How do I create a game?",
          a: "Click the 'Create Game' button in the navigation menu. Fill in the game details including date, time, location, and opponent. You can also set up formations and track player availability."
        },
        {
          q: "Can I edit a game after creating it?",
          a: "Yes, as the game creator or organization owner, you can edit game details at any time before the game starts. Navigate to the game details page and click the edit button."
        },
        {
          q: "How does player availability work?",
          a: "Players can mark their availability for each game (Available, Maybe, Not Available). This helps you plan your lineup and formations accordingly."
        }
      ]
    },
    {
      category: "Team Roster",
      questions: [
        {
          q: "How do I update my player profile?",
          a: "Navigate to your profile page and click the edit button. You can update your name, position, jersey number, profile picture, and other details."
        },
        {
          q: "Can I remove a player from my team?",
          a: "Only the organization owner can remove players from the roster. This can be done through the Admin Panel by clicking the delete button next to a player's name."
        },
        {
          q: "What information is visible to other team members?",
          a: "Other team members can see your name, profile picture, position, jersey number, and basic stats. Your email and personal information remain private unless you choose to share them."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          q: "What is the formation board?",
          a: "The formation board allows you to create and visualize your team's lineup for each game. You can drag and drop players into positions and save multiple formation options."
        },
        {
          q: "How do skill ratings work?",
          a: "After each game, team members can rate each player's performance in various skills. These ratings help track individual player development and team performance over time."
        },
        {
          q: "Can I chat with my team?",
          a: "Yes! RosterHub includes a built-in messaging system where you can communicate with individual team members or participate in team-wide conversations."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          q: "Is RosterHub free to use?",
          a: "Yes, RosterHub is currently free for all users. We may introduce premium features in the future, but core functionality will always remain accessible."
        },
        {
          q: "How do I delete my account?",
          a: "To delete your account, you can delete yourself via the UI, or ask your team admin, or you can contact our support team at sherpa.sjs@gmail.com. We'll process your request and remove all associated data."
        },
        {
          q: "Can I change my email address?",
          a: "Unfortunately, you cannot change your email address once it has been set. However, you can update your password, name, and other profile information."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-4xl sm:text-5xl font-oswald font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find quick answers to common questions about RosterHub
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;
                  
                  return (
                    <div
                      key={questionIndex}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full flex items-center justify-between text-left py-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <FaChevronUp className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="text-gray-600 dark:text-gray-400 mt-2 pl-4 border-l-4 border-blue-500 animate-in slide-in-from-top">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Didn't find what you're looking for?</h2>
          <p className="text-lg mb-6 opacity-90">
            Contact our support team and we'll be happy to help!
          </p>
          <Link
            to="/help"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
