import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({ validation: { logErrors: false } });

async function check() {
    try {
        console.log("Checking SPY quote...");
        const quote = await yahooFinance.quote('SPY', {}, { validateResult: false });
        console.log("Quote:", quote.regularMarketPrice);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}
check();
