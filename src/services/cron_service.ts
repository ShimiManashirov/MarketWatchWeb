import cron from 'node-cron';
import stockService from './stock_service';

let alertTask: any;

const initCronJobs = () => {
    // Check alerts every 5 minutes
    alertTask = cron.schedule('*/5 * * * *', async () => {
        console.log('Running stock alert check...');
        await stockService.checkAlerts();
    });
    console.log('Stock Alert Cron Job scheduled (Every 5 mins)');
};

const stopCronJobs = () => {
    if (alertTask) {
        alertTask.stop();
        console.log('Stock Alert Cron Job stopped');
    }
};

export default { initCronJobs, stopCronJobs };
