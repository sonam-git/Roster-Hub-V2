import { useNavigate } from "react-router-dom";
import GameForm from "../components/GameForm";

const GameCreate = () => {
  const navigate = useNavigate();

  const handleGameCreated = (newGame) => {
    // Navigate to the newly created game's details page
    navigate(`/game-schedule/${newGame._id}`);
  };

  const handleBackToGames = () => {
    // Navigate back to the game schedule
    navigate('/game-schedule');
  };

  return (
    <div className="mt-4 mb-6 w-full max-w-full overflow-hidden px-2 sm:px-0 pt-20 lg:pt-24 relative z-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 w-full lg:w-auto text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Game
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              Schedule a new game for your team
            </p>
          </div>
        </div>
      </div>

      {/* Game Form */}
      <div className="w-full relative z-10">
        <GameForm 
          onGameCreated={handleGameCreated}
          onBackToGames={handleBackToGames}
        />
      </div>
    </div>
  );
};

export default GameCreate;