import re

with open("src/components/LeaderboardScreen.jsx", "r") as f:
    content = f.read()

# Remove MOCK_LEADERBOARD_DATA definition
content = re.sub(
    r"const MOCK_LEADERBOARD_DATA = \[\n(?:.*?)\n\];\n",
    "",
    content,
    flags=re.DOTALL
)

# Fix baseStandings logic
content = re.sub(
    r"const baseStandings = liveStandings\.length > 0 \? liveStandings : MOCK_LEADERBOARD_DATA;",
    "const baseStandings = liveStandings;",
    content
)

# Fix currentUserRank usage in pinned card and elsewhere (replace MOCK_LEADERBOARD_DATA.length with something safe, maybe `baseStandings.length > 0 ? baseStandings.length : 100` or just remove the check entirely. Wait, let's see how it's used. "currentUserRank > MOCK_LEADERBOARD_DATA.length ? '-' : currentUserRank")

# Let's replace the usage in the pinned card
content = re.sub(
    r"\{currentUserRank > MOCK_LEADERBOARD_DATA\.length \? '-' : currentUserRank\}",
    "{currentUserRank}",
    content
)


with open("src/components/LeaderboardScreen.jsx", "w") as f:
    f.write(content)
