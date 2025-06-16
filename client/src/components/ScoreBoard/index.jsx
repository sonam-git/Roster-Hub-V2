// src/components/Scoreboard.jsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_MATCHES } from "../../utils/queries";
import format from "date-fns/format";
import addDays from "date-fns/addDays";

export default function Scoreboard({ competitionCode, title }) {
  const [view, setView] = useState("LIVE"); // or "SCHEDULED"

  // compute two-week window only when viewing schedule
  const { dateFrom, dateTo } = useMemo(() => {
    if (view !== "SCHEDULED") return {};
    const today = new Date();
    return {
      dateFrom: format(today, "yyyy-MM-dd"),
      dateTo:   format(addDays(today, 14), "yyyy-MM-dd"),
    };
  }, [view]);

  const { data, loading, error } = useQuery(GET_MATCHES, {
    variables: {
      code:      competitionCode,
      status:    view,
      dateFrom,
      dateTo,
    },
    pollInterval: view === "LIVE" ? 30_000 : 0,
  });

  if (loading) return <p>Loading {title}…</p>;
  if (error)   return <p>Error loading {title}</p>;

  return (
    <div className="shadow rounded-md p-4 mb-4 ">
      <h3 className="font-bold mb-2">{title}</h3>

      {/* tabs */}
      <div className="mb-3 flex space-x-2">
        {["LIVE", "SCHEDULED"].map((s) => (
          <button
            key={s}
            onClick={() => setView(s)}
            className={
              (view === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300") +
              " px-3 py-1 rounded"
            }
          >
            {s === "LIVE" ? "Live" : "Upcoming"}
          </button>
        ))}
      </div>

      {/* list */}
      {data.soccerMatches.length > 0 ? (
        data.soccerMatches.map((m, i) => (
          <div key={i} className="flex justify-between py-1 border-b dark:bg-gray-400">
            <span>
              {m.homeTeam} {m.homeGoals ?? "-"}–{m.awayGoals ?? "-"} {m.awayTeam}
            </span>
            {view === "LIVE" ? (
              <span className="text-xs text-red-500">{m.status}</span>
            ) : (
              <span className="text-xs text-gray-500">
                {format(new Date(m.utcDate), "PPpp")}
              </span>
            )}
          </div>
        ))
      ) : (
        <p>
          {view === "LIVE"
            ? "No live matches right now."
            : "No upcoming matches in the next 2 weeks."}
        </p>
      )}
    </div>
  );
}
