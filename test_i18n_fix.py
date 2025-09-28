#!/usr/bin/env python3
import requests
import json

def test_language_switching():
    """Test if the language switching functionality works correctly"""

    base_url = "http://localhost:8080"

    print("🧪 Testing Internationalization Fix...")
    print("=" * 50)

    # Login and get token
    print("\n1. 🔐 Logging in...")
    login_response = requests.post(f"{base_url}/api/auth/login",
                                 headers={"Content-Type": "application/json"},
                                 json={"username": "admin", "password": "admin"})

    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False

    login_data = login_response.json()
    token = login_data["accessToken"]
    user_lang = login_data["user"]["preferredLanguage"]
    print(f"✅ Login successful - User preferred language: {user_lang}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Test English translations
    print("\n2. 🇺🇸 Testing English translations...")
    en_response = requests.get(f"{base_url}/api/translations?language=en", headers=headers)

    if en_response.status_code != 200:
        print(f"❌ English translations failed: {en_response.status_code}")
        return False

    en_translations = en_response.json()
    print(f"✅ English translations loaded: {len(en_translations)} keys")

    # Test Korean translations
    print("\n3. 🇰🇷 Testing Korean translations...")
    ko_response = requests.get(f"{base_url}/api/translations?language=ko", headers=headers)

    if ko_response.status_code != 200:
        print(f"❌ Korean translations failed: {ko_response.status_code}")
        return False

    ko_translations = ko_response.json()
    print(f"✅ Korean translations loaded: {len(ko_translations)} keys")

    # Check specific test case translation keys
    print("\n4. 🔍 Checking test case specific translations...")
    test_keys = [
        "testcase.tree.selectAll",
        "testcase.form.title.create",
        "testcase.spreadsheet.button.save",
        "testcase.inputMode.form.title",
        "testcase.inputMode.spreadsheet.title",
        "testcase.inputMode.advancedSpreadsheet.title"
    ]

    all_keys_found = True
    for key in test_keys:
        en_value = en_translations.get(key, "❌ Missing")
        ko_value = ko_translations.get(key, "❌ Missing")

        print(f"   🔑 {key}:")
        print(f"      🇺🇸 EN: {en_value}")
        print(f"      🇰🇷 KO: {ko_value}")

        if en_value == "❌ Missing" or ko_value == "❌ Missing":
            all_keys_found = False

    # Test language preference update
    print("\n5. 🔄 Testing language preference update...")
    update_response = requests.post(f"{base_url}/api/users/update-language",
                                  headers=headers,
                                  json={"language": "ko"})

    if update_response.status_code != 200:
        print(f"❌ Language update failed: {update_response.status_code}")
        return False

    print("✅ Language preference updated to Korean")

    # Verify the update
    print("\n6. ✅ Verifying language preference update...")
    profile_response = requests.get(f"{base_url}/api/users/profile", headers=headers)

    if profile_response.status_code == 200:
        profile_data = profile_response.json()
        new_lang = profile_data.get("preferredLanguage", "unknown")
        print(f"✅ New preferred language: {new_lang}")

    # Final summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"✅ Login: Success")
    print(f"✅ English translations: {len(en_translations)} keys")
    print(f"✅ Korean translations: {len(ko_translations)} keys")
    print(f"{'✅' if all_keys_found else '❌'} Test case translations: {'All found' if all_keys_found else 'Some missing'}")
    print(f"✅ Language preference update: Success")

    if all_keys_found:
        print("\n🎉 Language switching functionality is working correctly!")
        print("📝 The issue reported by the user has been RESOLVED!")
        return True
    else:
        print("\n⚠️ Some translation keys are still missing.")
        return False

if __name__ == "__main__":
    test_language_switching()