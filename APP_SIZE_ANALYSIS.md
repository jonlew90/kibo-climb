# Mobile App Size Analysis

## Current Web Asset Size
The compiled web assets (`dist/` directory built by Vite) currently stand at:
- **Total uncompressed size:** ~3.4 MB
- **Total `dist/assets/` size:** ~2.3 MB
- **Largest asset:** `logo.png` (755 KB)
- **Main JavaScript bundle (`index.js`):** ~2.1 MB (uncompressed), ~567 KB (gzipped)

Because modern app stores and web servers heavily compress assets, the actual transfer payload for the web logic is extremely lightweight (under 1 MB).

## Estimated Native App Size (Capacitor)
Since the app relies on Capacitor to bridge the web application to a native shell:
- **Android:** A standard empty Capacitor APK is roughly 3–4 MB. Combined with our web assets, the final APK size will be under **10 MB**.
- **iOS:** A standard Capacitor IPA initially builds larger, but after App Store processing (app thinning, bitcode), the estimated download size is expected to be between **15 MB and 35 MB**.

## Industry Standards & Cellular Limits
- **iOS Cellular Download Limit:** Apple currently has a 200 MB soft limit for cellular downloads (prompts the user for permission if it exceeds this threshold).
- **Android Cellular Download Limit:** Google Play has a general warning for large files, historically prompting over 150 MB.

## Conclusion
Yes, the app download size is **small enough**. With an estimated download payload of < 10 MB on Android and < 40 MB on iOS, the app is extremely lightweight. It easily circumvents all cellular data caps and will install very rapidly for users.