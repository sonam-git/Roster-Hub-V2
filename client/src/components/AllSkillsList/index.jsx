import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { QUERY_PROFILES } from "../../utils/queries";
import { SKILL_ADDED_SUBSCRIPTION, SKILL_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL } from "../../utils/mutations";

export default function AllSkillsList({ isDarkMode }) {
  const { loading, error, data } = useQuery(QUERY_PROFILES);
  const [reactToSkill] = useMutation(REACT_TO_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES }],
  });

  // Subscribe to real-time skill add/delete
  useSubscription(SKILL_ADDED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });
  useSubscription(SKILL_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });

  if (loading) return <div className="text-center mt-4">Loading skills...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  // Flatten all skills from all profiles
  const allSkills = (data?.profiles || []).flatMap(profile =>
    (profile.skills || []).map(skill => ({ ...skill, profile }))
  );

  if (!allSkills.length) {
    return <div className="text-center italic dark:text-white mt-4">No skills endorsed yet.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-32 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
        {allSkills.map(skill => (
          <div
            key={skill._id}
            className={`rounded overflow-hidden flex flex-col justify-between h-32 border-2 shadow-lg ${isDarkMode ? 'border-white' : 'border-blue-900'}`}
          >
            <div className={`px-3 py-2 text-xs font-semibold tracking-wide border-b p-4 ${isDarkMode ? "bg-gray-700 text-gray-100" : "bg-blue-100 text-blue-800"}`}
              style={{ letterSpacing: '0.05em' }}>
              <span className="inline-block align-middle">
                {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
              </span>
              <span className="ml-1 text-gray-400 font-normal">endorsed </span>
              <span className="text-xs text-gray-500 italic">
                {skill.recipient?.name ? <strong>{skill.recipient.name}</strong> : "—"}
              </span>
            </div>
            <div className={`flex-1 flex items-center justify-between text-lg font-bold ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-blue-200 text-gray-900"}`}
              style={{ minHeight: '2.5rem' }}>
              <span className="text-left w-1/2 pl-2 truncate">{skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}</span>
              <div className="flex items-center justify-end w-1/2">
                {skill.reactions && skill.reactions.length > 0 && (
                  <div className="flex space-x-1 mr-2">
                    {skill.reactions.map((r, i) => (
                      <span key={i} title={r.user?.name || ""} className="text-xl">{r.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={`flex items-center justify-between px-3 py-2 border-t ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}> 
              <span className={`px-3 py-1 mb-2 rounded-full text-xs font-semibold shadow ${isDarkMode ? "bg-gray-700 text-gray-100" : "bg-blue-300 text-blue-900"}`}>{skill.createdAt}</span>
              <div className="flex items-center ml-2">
                {/* React button for all-skills view, improved style */}
                <SkillReaction 
                  onReact={emoji => reactToSkill({ variables: { skillId: skill._id, emoji } })}
                  buttonClass={`transition-colors duration-150 px-3 py-1 mb-2 rounded-full font-semibold shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-400 hover:text-white border-2 ${isDarkMode ? 'bg-yellow-500 text-white border-yellow-300' : 'bg-yellow-300 text-yellow-900 border-yellow-500'}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
