// using global fetch available in Node 18+

const backendUrl = 'https://parashari-jobs-portal-backend.onrender.com/api/otp/send';
const email = 'mohitdhanuka01@gmail.com'; // User's email from env, usually safe to test with their own email

console.log(`Testing Live OTP Send to: ${email}`);
console.log(`Target: ${backendUrl}`);

async function testLiveOTP() {
    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mimic the frontend origin to pass CORS/Checks if any (though backend allows server-to-server often, strict CORS might block if not handled, but we allowed no-origin in server.js)
            },
            body: JSON.stringify({ email })
        });

        console.log(`\nResponse Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', data);

        if (response.ok) {
            console.log('✅ Live OTP Send Success!');
        } else {
            console.log('❌ Live OTP Send Failed');
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

testLiveOTP();
