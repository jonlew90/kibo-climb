import re

with open('src/components/ProfileSelectorScreen.jsx', 'r') as f:
    content = f.read()

# Ah, I replaced `</div>\n    </div>\n  );\n}` with `      </div>\n    </div>\n  );\n}` for ALL functions.
# ProfileSelectorScreen has TWO components! CreateProfileFlow and ProfileSelectorScreen.
# The previous regex matched both! Let's fix CreateProfileFlow by removing the extra div.
content = content.replace(
"""      )}
      </div>
    </div>
  );
}""",
"""      )}
    </div>
  );
}""")

with open('src/components/ProfileSelectorScreen.jsx', 'w') as f:
    f.write(content)
