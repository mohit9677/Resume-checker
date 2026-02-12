// verify debug endpoint
async function check() {
    console.log('Checking: https://parashari-jobs-portal-backend.onrender.com/api/debug/email-check');
    try {
        console.log('Fetching...');
        const res = await fetch('https://parashari-jobs-portal-backend.onrender.com/api/debug/email-check', {
            signal: AbortSignal.timeout(30000)
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}
check();
