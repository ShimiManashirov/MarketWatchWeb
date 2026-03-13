import dotenv from 'dotenv';
dotenv.config();

import geminiService from './src/services/gemini_service';

async function run() {
    try {
        console.log("Calling smartSearch...");
        const res = await geminiService.smartSearch("market search");
        console.log("SUCCESS_RESULTS:");
        console.log(JSON.stringify(res, null, 2));
    } catch (e: any) {
        console.log("FAIL_RESULTS:");
        console.error(e.message);
    }
}
run();
