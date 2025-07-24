import { useQuery, useSubscription } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { GAME_CREATED_SUBSCRIPTION, GAME_CONFIRMED_SUBSCRIPTION, GAME_UPDATED_SUBSCRIPTION, GAME_COMPLETED_SUBSCRIPTION, GAME_CANCELLED_SUBSCRIPTION, GAME_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons";

export default function CustomComingGames({ isDarkMode }) {
  const { loading, error, data } = useQuery(QUERY_GAMES);

  // Subscribe to all relevant game events for real-time updates
  useSubscription(GAME_CREATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_UPDATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_COMPLETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CANCELLED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = (data?.games || []).filter(g => g.status === "PENDING" || g.status === "CONFIRMED");
  if (!games.length) {
    return <div className="text-center italic dark:text-white mt-4">No upcoming games.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {games.map(game => {
          // Format date and time like GameDetails
          let humanDate = game.date;
          let humanTime = game.time;
          // Try to parse date if it's a timestamp
          if (!isNaN(Number(game.date))) {
            const dateObj = new Date(Number(game.date));
            humanDate = dateObj.toLocaleDateString();
          }
          if (game.time) {
            const [h, m] = game.time.split(":").map(Number);
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            humanTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
          }
          return (
            <div
              key={game._id}
              className={`relative rounded-2xl shadow-xl p-6 flex flex-col mt-8 border-2 transition-all duration-300
                bg-gradient-to-br
                ${isDarkMode ? "from-gray-800 via-gray-700 to-gray-900 border-gray-700 text-white" : "from-blue-50 via-white to-blue-100 border-blue-300 text-gray-900"}
                hover:scale-[1.02] hover:ring-4 hover:ring-blue-400
              `}
            >
              <div className="flex justify-between items-center mb-4">
                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPersonRunning} className="text-green-500 text-2xl mr-2" />
                  <span className={`font-extrabold text-xl tracking-tight drop-shadow-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.opponent}</span>
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2
                  ${game.status === "CONFIRMED" ? (isDarkMode ? "bg-green-700 text-green-200 border-green-400" : "bg-green-200 text-green-800 border-green-400")
                  : "bg-yellow-200 text-yellow-800 border-yellow-400"}`}>{game.status}</span>
              </div>
              <div className="mb-2 flex flex-col gap-1">
                <div className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}><span className="font-bold">Date:</span> <span className="font-semibold text-gray-500 dark:text-gray-50">{humanDate}</span></div>
                <div className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}><span className="font-bold">Time:</span> <span className="font-semibold text-gray-500 dark:text-gray-50">{humanTime}</span></div>
                <div className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}><span className="font-bold">Venue:</span> <span className="font-semibold text-gray-500 dark:text-gray-50">{game.venue}</span></div>
                <div className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}>
                  <span className="font-bold">Notes:</span> <span className="italic text-gray-500 dark:text-gray-50">{game.notes ? game.notes : "No note provided for this game."}</span>
                </div>
                <div className={`text-base ${isDarkMode ? 'text-blue-200' : 'text-blue-500'}`}>
                  <span className="font-bold">Available Players:</span> <span className="font-semibold text-gray-500 dark:text-gray-50">{game.availableCount}</span>
                </div>
              </div>
              <button
                className={`mt-4 px-5 py-2 rounded-lg font-bold shadow-lg transition-all duration-200 self-end
                  ${isDarkMode ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-500 text-white hover:bg-blue-700"}
                  focus:outline-none focus:ring-2 focus:ring-blue-400`
                }
                onClick={() => window.location.href = `/game-schedule/${game._id}`}
              >
                Details
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
