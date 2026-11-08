// 1. Batch-wise Summary Report (FCR, Mortality %, Feed Issued, Closing Feed, Live Birds)
router.get('/reports/batch-summary', async (req, res) => {
    try {
        const chicks = await ChicksEntry.find().populate('farmerId', 'name farmId branch');
        const dailyLogs = await DailyEntry.find();
        const feedRequests = await FeedRequest.find();
        const sales = await SaleEntry.find();

        let report = chicks.map(c => {
            const batchNo = c.batchNo;
            const logs = dailyLogs.filter(d => d.batchNo === batchNo);
            const batchFeeds = feedRequests.filter(f => f.batchNo === batchNo);
            const batchSales = sales.filter(s => s.batchNo === batchNo);

            const totalMortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
            
            // 1. Total Feed Issued from Godown (`FeedRequest`)
            const totalFeedIssued = batchFeeds.reduce((sum, f) => sum + (f.quantity || 0), 0);
            
            // 2. Total Feed Consumed from Daily Logs
            const totalFeedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);

            // Agar Godown se feed issue nahi hua par daily log me entry hai, toh fallback
            const totalFeedKg = totalFeedIssued > 0 ? totalFeedIssued : totalFeedConsumed;

            const totalSoldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || 0), 0);
            const totalSoldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
            const totalRevenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

            // Live Birds Calculation
            const liveBirds = c.quantity - totalMortality - totalSoldBirds;

            // Closing Feed Calculation = Total Feed Issued - Total Feed Consumed in Daily Logs
            const closingFeed = totalFeedIssued - totalFeedConsumed;

            // Latest Body Weight from Daily Logs (Gram)
            let latestBodyWeightGm = 0;
            if (logs.length > 0) {
                const sortedLogs = [...logs].sort((a, b) => (b.ageInDays || 0) - (a.ageInDays || 0));
                latestBodyWeightGm = sortedLogs[0].bodyWeightGm || 0;
            }

            // Total Estimated Live Weight (Kg)
            const liveWeightKg = ((liveBirds * latestBodyWeightGm) / 1000);

            // Total Weight (Sold Weight + Current Live Weight of remaining birds)
            const totalEffectiveWeightKg = totalSoldWeight + liveWeightKg;

            // FCR Calculation = Total Feed Consumed / Total Effective Weight (Sold + Live Estimated)
            // Agar effective weight 0 hai, toh FCR 0.00 rahega
            const fcr = totalEffectiveWeightKg > 0 ? (totalFeedConsumed / totalEffectiveWeightKg).toFixed(2) : '0.00';
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
                totalFeedKg: totalFeedConsumed, // Displaying actual consumed feed in report
                totalFeedIssued,
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
