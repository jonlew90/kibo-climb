import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Create a context with video recording enabled
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos/",
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        print("Navigating to local server...")
        await page.goto("http://localhost:5173")

        # Bypass onboarding & skip profile selector
        print("Setting local storage to bypass onboarding...")
        await page.evaluate("""
            localStorage.setItem('kibo_math_has_onboarded', 'true');
            localStorage.setItem('kibo_math_tier', '1');
            sessionStorage.setItem('kibo_parent_authenticated', 'true');

            // To ensure only one profile exists and bypass the Profile Selector
            localStorage.setItem('kibo_profiles_data', JSON.stringify({
              "default": {
                 "id": "default",
                 "name": "TestUser",
                 "avatarId": "avatar_default",
                 "activeUserData": {
                    "tier": 1,
                    "hasVisitedParentZone": true
                 },
                 "activeShopState": {}
              }
            }));
            localStorage.setItem('kibo_active_profile_id', 'default');
        """)
        await page.reload()

        print("Waiting for main game view...")

        # If it's on profile selector screen, just tap the profile card to proceed
        try:
            print("Checking for Profile Card...")
            await page.click('text="Kibo Climber"', timeout=3000)
            print("Clicked Kibo Climber profile card")
        except Exception:
            try:
                await page.click('text="TestUser"', timeout=3000)
                print("Clicked TestUser profile card")
            except Exception:
                pass

        # Wait for something indicative of the main view
        try:
            await page.wait_for_selector('button:has-text("1")', timeout=10000)
            print("Adaptive Session view detected (found digit 1).")
        except Exception as e:
            print(f"Error waiting for AdaptiveSessionView: {e}")
            await page.screenshot(path="/home/jules/verification/screenshots/verification_after_click.png")

        print("Triggering timer start by typing a digit...")
        # Click a digit to trigger first keystroke
        try:
            await page.get_by_text("1", exact=True).first.click(timeout=5000)
        except Exception:
            await page.screenshot(path="/home/jules/verification/screenshots/verification_after_click.png")

        print("Waiting 2 seconds to let the timer run...")
        await asyncio.sleep(2)

        print("Opening a modal to pause the app (Parent Zone)...")
        try:
            await page.click('button[title="Parent Zone (PIN Protected)"]', timeout=5000)
            print("Clicked Parent Zone.")
        except Exception as e:
            print("Could not find Parent Zone button.", e)

        print("Waiting 3 seconds while paused...")
        await asyncio.sleep(3)

        print("Closing the modal to unpause...")
        try:
            await page.click('button[aria-label="Close Parent Dashboard"]', timeout=5000)
            print("Closed Parent Dashboard.")
        except:
            try:
                # Try close button with generic text
                await page.click('button:has-text("Close")', timeout=5000)
                print("Closed modal.")
            except:
                pass

        print("Waiting 1 second after unpause...")
        await asyncio.sleep(1)

        print("Taking final screenshot...")
        await page.screenshot(path="/home/jules/verification/screenshots/verification_timer_test.png")

        # Close context to ensure video is saved
        await context.close()
        await browser.close()
        print("Verification complete.")

asyncio.run(main())
