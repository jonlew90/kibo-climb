import re

with open("src/components/LeaderboardScreen.jsx", "r") as f:
    content = f.read()


content = re.sub(
    r"\{\/\* HERO PODIUM \(Top 3\) \*\/\}\n\s*\{top3\.length >= 3 && \(",
    """{/* HERO PODIUM (Top 3) */}
        {top3.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Trophy className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Standings Yet</h3>
            <p className="text-sm text-slate-500">Check back later once players have started earning points!</p>
          </div>
        )}
        {top3.length >= 3 && (""",
    content
)


with open("src/components/LeaderboardScreen.jsx", "w") as f:
    f.write(content)
