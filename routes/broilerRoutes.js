// --- REPORTS API ---

// 1. Batch-wise Summary Report (FCR, Mortality %, Total Feed, Closing Stock, Live Birds)
router.get('/reports/batch-summary', async (req, res) => {
    try {
        const chicks = await ChicksEntry.find().populate('farmerId', 'name farmId branch');
        const dailyLogs = await DailyEntry.find();
        const feedRequests = await FeedRequest.find({ status: 'Accepted' }); // Sirf approved feed count hoga
        const sales = await SaleEntry.find();

        let report = chicks.map(c => {
            const batchNo = c.batchNo;
            const logs = dailyLogs.filter(d => d.batchNo === batchNo);
            const batchFeeds = feedRequests.filter(f => f.batchNo === batchNo);
            const batchSales = sales.filter(s => s.batchNo === batchNo);

            const totalMortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
            
            // Total Feed Issued from Godown + Daily entry feed consumed
            const totalFeedIssued = batchFeeds.reduce((sum, f) => sum + (f.quantity || 0), 0);
            const dailyFeedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);
            const totalFeedKg = totalFeedIssued > 0 ? totalFeedIssued : dailyFeedConsumed;

            const totalSoldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || 0), 0);
            const totalSoldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
            const totalRevenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

            // Live Birds Calculation
            const liveBirds = c.quantity - totalMortality - totalSoldBirds;

            // Closing Feed Calculation (Issued Feed - Consumed Feed roughly, or track stock)
            const closingFeed = totalFeedIssued - dailyFeedConsumed;

            // Calculate FCR = Total Feed Consumed (Kg) / Total Weight Sold (Kg)
            const fcr = totalSoldWeight > 0 ? (totalFeedKg / totalSoldWeight).toFixed(2) : '0.00';
            const mortalityPercent = c.quantity > 0 ? ((totalMortality / c.quantity) * 100).toFixed(1) : '0.0';

            return {
                batchNo: c.batchNo,
                farmerName: c.farmerId ? c.farmerId.name : 'N/A',
                farmId: c.farmerId ? c.farmerId.farmId : 'N/A',
                branch: c.branch,
                placedChicks: c.quantity,
                liveBirds: liveBirds >= 0 ? liveBirds : 0,
                totalMortality,
                mortalityPercent,
                totalFeedKg,
                closingFeed: closingFeed >= 0 ? closingFeed : 0,
                totalSoldBirds,
                totalSoldWeight,
                totalRevenue,
                fcr
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
