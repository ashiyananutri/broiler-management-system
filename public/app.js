async function loadReportView(reportType) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');

    if (reportType === 'batch') {
        title.textContent = 'Batch Performance & FCR Report';
        content.innerHTML = `<div class="text-center py-10 font-semibold text-gray-500">Loading Batch Summary...</div>`;

        try {
            const res = await fetch('/api/broiler/reports/batch-summary');
            const data = await res.json();

            let rows = '';
            data.forEach((b, i) => {
                rows += `
                    <tr class="border-b hover:bg-gray-50 text-xs md:text-sm">
                        <td class="py-3 px-3">${i + 1}</td>
                        <td class="py-3 px-3 font-semibold text-gray-900">${b.batchNo}</td>
                        <td class="py-3 px-3">${b.farmerName} <span class="text-gray-400">(${b.farmId})</span></td>
                        <td class="py-3 px-3">${b.placedChicks}</td>
                        <td class="py-3 px-3 text-red-600 font-semibold">${b.totalMortality} (${b.mortalityPercent}%)</td>
                        <td class="py-3 px-3 text-green-700 font-bold">${b.liveBirds} Pcs</td>
                        <td class="py-3 px-3 font-medium text-blue-700">${b.totalFeedKg} Kg</td>
                        <td class="py-3 px-3 font-medium text-purple-700">${b.closingFeed} Kg</td>
                        <td class="py-3 px-3 font-medium text-amber-700">${b.totalSoldWeight} Kg</td>
                        <td class="py-3 px-3 font-bold text-gray-800 bg-gray-50 rounded">${b.fcr}</td>
                        <td class="py-3 px-3 font-bold text-green-800">₹${b.totalRevenue.toLocaleString('en-IN')}</td>
                    </tr>
                `;
            });

            content.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b gap-3">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Batch-wise Performance & FCR Report</h3>
                            <p class="text-xs text-gray-500">Includes Live Birds, Closing Feed Stock, Mortality %, & FCR Ratio</p>
                        </div>
                        <button onclick="window.print()" class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition"><i class="fa-solid fa-print mr-1"></i> Print Report</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-xs uppercase font-semibold">
                                    <th class="py-3 px-3">#</th>
                                    <th class="py-3 px-3">Batch No</th>
                                    <th class="py-3 px-3">Farmer</th>
                                    <th class="py-3 px-3">Placed</th>
                                    <th class="py-3 px-3">Mortality</th>
                                    <th class="py-3 px-3">Live Birds</th>
                                    <th class="py-3 px-3">Feed Issued</th>
                                    <th class="py-3 px-3">Closing Feed</th>
                                    <th class="py-3 px-3">Total Sale</th>
                                    <th class="py-3 px-3">FCR</th>
                                    <th class="py-3 px-3">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.length > 0 ? rows : `<tr><td colspan="11" class="text-center py-6 text-gray-400">No batch records found.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch(e) {
            content.innerHTML = `<div class="text-red-500 font-semibold p-4">Failed to load batch report!</div>`;
        }
    }
}
