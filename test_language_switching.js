const fetch = require('node-fetch');

async function testLanguageSwitching() {
    try {
        console.log('🧪 Testing Language Switching Functionality...\n');

        // Test login first
        console.log('1. Testing login...');
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse.status);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        const token = loginData.accessToken;

        // Test translation API in Korean
        console.log('\n2. Testing translation API in Korean...');
        const koreanResponse = await fetch('http://localhost:8080/api/translations?language=ko', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!koreanResponse.ok) {
            console.error('❌ Korean translation API failed:', koreanResponse.status);
            return;
        }

        const koreanTranslations = await koreanResponse.json();
        console.log('✅ Korean translations loaded');

        // Check for test case related translations
        const testCaseKoreanKeys = Object.keys(koreanTranslations).filter(key =>
            key.startsWith('testcase.')
        );
        console.log(`📋 Found ${testCaseKoreanKeys.length} Korean testcase translation keys`);

        // Test translation API in English
        console.log('\n3. Testing translation API in English...');
        const englishResponse = await fetch('http://localhost:8080/api/translations?language=en', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!englishResponse.ok) {
            console.error('❌ English translation API failed:', englishResponse.status);
            return;
        }

        const englishTranslations = await englishResponse.json();
        console.log('✅ English translations loaded');

        // Check for test case related translations
        const testCaseEnglishKeys = Object.keys(englishTranslations).filter(key =>
            key.startsWith('testcase.')
        );
        console.log(`📋 Found ${testCaseEnglishKeys.length} English testcase translation keys`);

        // Compare some key translations
        console.log('\n4. Comparing key translations...');
        const testKeys = [
            'testcase.tree.selectAll',
            'testcase.form.title.create',
            'testcase.spreadsheet.button.save',
            'testcase.inputMode.form.title'
        ];

        let allTranslationsFound = true;
        for (const key of testKeys) {
            const koreanValue = koreanTranslations[key];
            const englishValue = englishTranslations[key];

            console.log(`🔍 ${key}:`);
            console.log(`   한국어: ${koreanValue || '❌ 없음'}`);
            console.log(`   English: ${englishValue || '❌ 없음'}`);

            if (!koreanValue || !englishValue) {
                allTranslationsFound = false;
            }
        }

        // Test update language preference API
        console.log('\n5. Testing language preference update...');
        const updateLangResponse = await fetch('http://localhost:8080/api/users/update-language', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: 'en'
            })
        });

        if (!updateLangResponse.ok) {
            console.error('❌ Language preference update failed:', updateLangResponse.status);
            return;
        }

        console.log('✅ Language preference updated to English');

        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`✅ Login: Success`);
        console.log(`✅ Korean translations: ${testCaseKoreanKeys.length} keys`);
        console.log(`✅ English translations: ${testCaseEnglishKeys.length} keys`);
        console.log(`${allTranslationsFound ? '✅' : '❌'} Test case translations: ${allTranslationsFound ? 'All found' : 'Some missing'}`);
        console.log(`✅ Language preference update: Success`);

        if (allTranslationsFound && testCaseKoreanKeys.length > 0 && testCaseEnglishKeys.length > 0) {
            console.log('\n🎉 Language switching functionality appears to be working correctly!');
        } else {
            console.log('\n⚠️ There may be issues with the translation system.');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testLanguageSwitching();