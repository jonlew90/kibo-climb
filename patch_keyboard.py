with open("src/App.jsx", "r") as f:
    content = f.read()

# Remove the broken function remains from line 512 to 578 approx
start_idx = content.find("  // Reset inputVal to clean \"\" whenever problem index changes")
end_idx = content.find("  const startPlacementDiagnostic = () => {")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

with open("src/App.jsx", "w") as f:
    f.write(content)
