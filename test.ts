import yahooFinance from 'yahoo-finance2';

async function test() {
    try {
        const results = await yahooFinance.historical('SPY', {
            period1: '2026-02-08',
            period2: '2026-03-08',
            interval: '1d'
        }, { validateResult: false });
        console.log("Success! Length:", results.length);
    } catch (e: any) {
        console.error("Test Error:", e.name, e.message);
    }
}
test();
