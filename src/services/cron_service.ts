import cron from 'node-cron';
import stockService from './stock_service';

const initCronJobs = () => {
    // Check alerts every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running stock alert check...');
        await stockService.checkAlerts();
    });
    console.log('Stock Alert Cron Job scheduled (Every 5 mins)');
};

export default { initCronJobs };
