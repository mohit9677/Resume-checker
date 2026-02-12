import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://parashari_app:C0dqzpdko88wAFNA@mohitfreecluster.oidrd0m.mongodb.net/parashari-job-db?appName=mohitfreecluster';

async function resetCandidates() {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    try {
        console.log('Deleting all candidates...');
        const result = await db.collection('candidates').deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} candidate records.`);

        const otpResult = await db.collection('otps').deleteMany({});
        console.log(`✅ Deleted ${otpResult.deletedCount} OTP records.`);

    } catch (error) {
        console.error('❌ Error resetting candidates:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB.');
    }
}

resetCandidates();
