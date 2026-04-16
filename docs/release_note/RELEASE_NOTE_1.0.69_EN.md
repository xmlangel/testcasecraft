# Release Note - v1.0.69

## [1.0.69] - 2026-04-16

In this update, we’ve made Google Sheets integration much safer and consolidated complex settings into one easy-to-manage location. We’ve also refined the interface so you can find the information you need more easily.

### Major Changes

#### 🚀 Smarter and Safer Google Sheets Integration
- **Stay Safe with Your Data**: We’ve improved how data is saved and updated by introducing a thorough internal verification process before processing everything at once. Now you can sync with confidence, knowing your data won’t be corrupted or lost.
- **Friendly Guidance on Issues**: If there’s a conflict or error during file uploads, we now provide clear, detailed instructions on what went wrong. You can now fix issues immediately based on the feedback.
- **Display IDs Everywhere**: You can now see the unique ID of each test case directly in the list and at the top of the screen. This makes comparing with other documents much easier.

#### ✨ Cleaner and More Intuitive UI/UX
- **Goodbye, Complex Settings**: We’ve moved the Google Sheets settings, which used to be hard to find, right into your "User Profile." Now you can manage your personal info and integration settings in one place.
- **Easier Renaming**: We’ve created a dedicated window for renaming test cases to prevent screen glitches or losing focus. Renaming is now cleaner and more accurate.
- **Streamlined Menu**: To tidy up the interface, we’ve hidden the rarely used "JSON" upload option. (Don’t worry, the underlying functionality remains for those who need it.)

#### 🛠️ Internal Optimizations for a Smoother Experience
- **More Robust Data Handling**: We’ve strengthened how the system retrieves information internally, reducing instances where data might suddenly disappear or show errors.
- **Cleaner System Logs**: We’ve organized the backend records to keep only the most essential information, making it easier to monitor the system.
- **Start Immediately with Ready-made Files**: We’ve updated the sample files for Excel and CSV to perfectly match the current system requirements. Just fill in the sample, and you’re ready to go!

#### 🔒 Security and Stability
- **Stable Login Session**: We’ve enhanced the login logic so that your session stays active even if the server restarts or your network environment changes.
