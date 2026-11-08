const app = document.getElementById('app');

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        renderDashboard();
    } else {
        renderLogin();
    }
}

// 1. RENDER LOGIN PAGE
function renderLogin() {
    app.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-800 to-gray-900">
            <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                <div class="text-center mb-8">
                    <div class="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                        <i class="fa-solid fa-kiwi-bird"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800">Broiler Management</h2>
                    <p class="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>
                
                <form id="loginForm" class="space-y-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input type="email" id="email" required class="w-full px-4 py-3 border rounded-lg text-sm" placeholder="admin@broiler.com">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input type="password" id="password" required class="w-full px-4 py-3 border rounded-lg text-sm" placeholder="••••••••">
                    </div>
                    <button type="submit" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg shadow-lg transition text-sm">
                        Sign In
                    </button>
                </form>
                <div id="message" class="mt-4 text-center text-sm font-medium"></div>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const msg = document.getElementById('message');

        msg.textContent = "Authenticating...";
        msg.className = "mt-4 text-center text-sm text-gray-500";

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                renderDashboard();
            } else {
                msg.textContent = data.message || "Invalid credentials!";
                msg.className = "mt-4 text-center text-sm text-red-600";
            }
        } catch (err) {
            msg.textContent = "Connection error to server!";
            msg.className = "mt-4 text-center text-sm text-red-600";
        }
    });
}

// 2. RENDER PROFESSIONAL DASHBOARD
function renderDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    app.innerHTML = `
        <style>
            @media print {
                aside, header, button, select, .no-print { display: none !important; }
                body, #mainContent, #farmerLedgerOutput { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                #app { display: block !important; }
            }
        </style>
        <div class="flex h-screen bg-gray-100 overflow-hidden relative">
            <div id="sidebarOverlay" onclick="toggleMobileSidebar()" class="fixed inset-0 bg-black/50 z-20 hidden md:hidden"></div>

            <aside id="sidebar" class="absolute md:relative inset-y-0 left-0 w-64 bg-gray-900 text-gray-300 flex flex-col shadow-xl transform -translate-x-full md:translate-x-0 transition-transform duration-300 z-30">
                <div class="p-5 border-b border-gray-800 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="bg-green-600 text-white p-2 rounded-lg">
                            <i class="fa-solid fa-kiwi-bird text-xl"></i>
                        </div>
                        <div>
                            <h1 class="font-bold text-white text-base">Broiler Admin</h1>
                            <p class="text-xs text-gray-400">Branch: ${user.branch || 'Main'} | Role: ${user.role}</p>
                        </div>
                    </div>
                    <button onclick="toggleMobileSidebar()" class="md:hidden text-gray-400 hover:text-white">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                    <a href="#" onclick="renderDashboard(); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-700 text-white font-medium text-sm">
                        <i class="fa-solid fa-chart-pie w-5"></i>
                        <span>Dashboard</span>
                    </a>

                    <!-- Master Creation Menu -->
                    <div class="pt-2">
                        <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Master Management</p>
                        <button onclick="toggleMasterMenu()" class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 font-medium text-sm transition">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-folder-tree w-5 text-green-500"></i>
                                <span>Master Creation</span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-xs" id="masterChevron"></i>
                        </button>
                        <div id="masterSubmenu" class="pl-4 mt-1 space-y-1 hidden">
                            <a href="#" onclick="loadMasterView('branch'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-code-branch text-xs"></i><span>Branches</span></a>
                            <a href="#" onclick="loadMasterView('user'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-user-plus text-xs"></i><span>Users</span></a>
                            <a href="#" onclick="loadMasterView('farmer'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-id-card text-xs"></i><span>Farmers</span></a>
                            <a href="#" onclick="loadMasterView('trader'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-handshake text-xs"></i><span>Traders</span></a>
                            <a href="#" onclick="loadMasterView('item'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-boxes-stacked text-xs"></i><span>Items</span></a>
                        </div>
                    </div>

                    <!-- Entry Section Menu -->
                    <div class="pt-2">
                        <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Entry Section</p>
                        <button onclick="toggleEntryMenu()" class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 font-medium text-sm transition">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-pen-to-square w-5 text-blue-500"></i>
                                <span>Transactions</span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-xs" id="entryChevron"></i>
                        </button>
                        <div id="entrySubmenu" class="pl-4 mt-1 space-y-1 hidden">
                            <a href="#" onclick="loadEntryView('chicks'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-kiwi-bird text-xs"></i><span>Chicks Entry</span></a>
                            <a href="#" onclick="loadEntryView('feed'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-boxes-packing text-xs"></i><span>Feed Out (Godown)</span></a>
                            <a href="#" onclick="loadEntryView('daily'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-chart-line text-xs"></i><span>Daily Entry</span></a>
                            <a href="#" onclick="loadEntryView('sale'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-file-invoice-dollar text-xs"></i><span>Sale Entry</span></a>
                        </div>
                    </div>

                    <!-- Reports Menu -->
                    <div class="pt-2">
                        <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reports & Analytics</p>
                        <button onclick="toggleReportMenu()" class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 font-medium text-sm transition">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-chart-column w-5 text-purple-500"></i>
                                <span>Reports</span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-xs" id="reportChevron"></i>
                        </button>
                        <div id="reportSubmenu" class="pl-4 mt-1 space-y-1 hidden">
                            <a href="#" onclick="loadReportView('batch'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-list-check text-xs"></i><span>Batch Summary Report</span></a>
                            <a href="#" onclick="loadReportView('farmer'); toggleMobileSidebar();" class="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white text-sm"><i class="fa-solid fa-book text-xs"></i><span>Farmer Ledger</span></a>
                        </div>
                    </div>
                </nav>

                <div class="p-4 border-t border-gray-800">
                    <button onclick="logout()" class="w-full flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2.5 rounded-lg font-medium text-sm transition">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div class="flex-1 flex flex-col overflow-hidden w-full">
                <header class="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 z-10">
                    <div class="flex items-center space-x-3">
                        <button onclick="toggleMobileSidebar()" class="md:hidden text-gray-700 hover:text-green-700 text-xl focus:outline-none">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <h2 class="text-lg md:text-xl font-bold text-gray-800 truncate" id="pageTitle">Dashboard Overview</h2>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="text-xs md:text-sm font-medium text-gray-600 hidden sm:inline">Welcome, <strong class="text-gray-900">${user.name || 'Admin'}</strong></span>
                        <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
                            ${(user.name || 'A')[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <main class="flex-1 overflow-y-auto p-4 md:p-8" id="mainContent">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 class="text-xl font-bold text-green-600 mt-1">System Connected 🚀</h3>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `;
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function toggleMasterMenu() {
    document.getElementById('masterSubmenu').classList.toggle('hidden');
    document.getElementById('masterChevron').classList.toggle('rotate-180');
}

function toggleEntryMenu() {
    document.getElementById('entrySubmenu').classList.toggle('hidden');
    document.getElementById('entryChevron').classList.toggle('rotate-180');
}

function toggleReportMenu() {
    document.getElementById('reportSubmenu').classList.toggle('hidden');
    document.getElementById('reportChevron').classList.toggle('rotate-180');
}

function autoFillBranch(selectObj) {
    const selectedOption = selectObj.options[selectObj.selectedIndex];
    document.getElementById('farmerBranch').value = selectedOption.getAttribute('data-branch') || '';
}

function autoFillEditBranch(selectObj) {
    const selectedOption = selectObj.options[selectObj.selectedIndex];
    document.getElementById('editFarmerBranch').value = selectedOption.getAttribute('data-branch') || '';
}

let currentFarmerBatches = [];

async function fetchBatchesForFarmer(farmerId, selectContainerId) {
    const container = document.getElementById(selectContainerId);
    if (!farmerId) {
        container.innerHTML = `<input type="text" readonly value="Select a farmer first" class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-400 text-sm">`;
        return;
    }

    container.innerHTML = `<input type="text" readonly value="Loading batches..." class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-400 text-sm">`;

    try {
        const res = await fetch(`/api/broiler/farmer-batches/${farmerId}`);
        currentFarmerBatches = await res.json();

        if (currentFarmerBatches.length === 0) {
            container.innerHTML = `<input type="text" readonly value="No active batch found for this farmer!" class="w-full px-4 py-2.5 border rounded-lg bg-red-50 text-red-500 text-sm font-medium">`;
            if (document.getElementById('ageDays')) document.getElementById('ageDays').value = '';
        } else if (currentFarmerBatches.length === 1) {
            const singleBatch = currentFarmerBatches[0];
            container.innerHTML = `
                <input type="text" id="selectedBatchNo" value="${singleBatch.batchNo}" readonly class="w-full px-4 py-2.5 border rounded-lg bg-green-50 text-green-800 font-semibold text-sm">
                <p class="text-xs text-green-600 mt-1"><i class="fa-solid fa-check"></i> Single active batch auto-selected: <strong>${singleBatch.batchNo}</strong></p>
            `;
            updateCalculatedAge(singleBatch.batchNo);
        } else {
            let options = '<option value="">-- Select Batch --</option>';
            currentFarmerBatches.forEach(b => {
                options += `<option value="${b.batchNo}">Batch: ${b.batchNo} (Qty: ${b.quantity})</option>`;
            });
            container.innerHTML = `
                <select id="selectedBatchNo" required onchange="updateCalculatedAge(this.value)" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm font-semibold">${options}</select>
                <p class="text-xs text-amber-600 mt-1"><i class="fa-solid fa-triangle-exclamation"></i> Is farmer ke 1 se zyada active batches hain, kripya batch select karein.</p>
            `;
        }
    } catch (err) {
        container.innerHTML = `<input type="text" readonly value="Error loading batches!" class="w-full px-4 py-2.5 border rounded-lg bg-red-50 text-red-500 text-sm">`;
    }
}

function updateCalculatedAge(selectedBatchNo) {
    const ageInput = document.getElementById('ageDays');
    if (!ageInput) return;

    const selectedBatch = currentFarmerBatches.find(b => b.batchNo === selectedBatchNo);
    if (!selectedBatch) {
        ageInput.value = '';
        return;
    }

    const placementDate = new Date(selectedBatch.date || selectedBatch.createdAt);
    const entryDateVal = document.getElementById('entryDate').value;
    const targetDate = entryDateVal ? new Date(entryDateVal) : new Date();

    const diffTime = Math.abs(targetDate - placementDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    ageInput.value = diffDays > 0 ? diffDays : 1;
}

// 3. MASTER LIST VIEW
async function loadMasterView(type) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    title.textContent = `${type.toUpperCase()} Management`;

    let apiGet = '';
    if (type === 'branch') apiGet = '/api/broiler/branches';
    else if (type === 'user') apiGet = '/api/auth/users-list';
    else if (type === 'farmer') apiGet = '/api/broiler/farmers';
    else if (type === 'trader') apiGet = '/api/broiler/traders';
    else if (type === 'item') apiGet = '/api/broiler/items';

    let records = [];
    try {
        const res = await fetch(apiGet);
        records = await res.json();
    } catch (err) {}

    let rowsHtml = '';
    records.forEach((item, index) => {
        let identifier = item.name || item.email || 'Record';
        let subInfo = '';
        
        if (type === 'user') {
            subInfo = `Email: <strong>${item.email || 'N/A'}</strong> | Branch: ${item.branch} | Role: ${item.role}`;
        } else if (type === 'farmer') {
            let supName = item.supervisorId ? item.supervisorId.name : 'Unassigned';
            subInfo = `Branch: <strong>${item.branch}</strong> | Supervisor: <strong>${supName}</strong> | Phone: ${item.phone}`;
        } else {
            subInfo = item.location || item.phone || item.category || item.branch || '';
        }

        let extraBadge = item.farmId ? `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono ml-2">${item.farmId}</span>` : '';

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-3 md:px-4 text-xs md:text-sm text-gray-700">${index + 1}</td>
                <td class="py-3 px-3 md:px-4 text-xs md:text-sm font-medium text-gray-900">${identifier} ${extraBadge}</td>
                <td class="py-3 px-3 md:px-4 text-xs md:text-sm text-gray-600">${subInfo}</td>
                <td class="py-3 px-3 md:px-4 text-right whitespace-nowrap">
                    ${isAdmin ? `
                        <button onclick="openEditModal('${type}', '${item._id}')" class="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-semibold mr-2 md:mr-3"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button onclick="deleteRecord('${type}', '${item._id}')" class="text-red-600 hover:text-red-800 text-xs md:text-sm font-semibold"><i class="fa-solid fa-trash"></i> Delete</button>
                    ` : `<span class="text-xs text-gray-400 italic">View Only</span>`}
                </td>
            </tr>
        `;
    });

    content.innerHTML = `
        <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b gap-3">
                <h3 class="text-base md:text-lg font-bold text-gray-800">All ${type.toUpperCase()} Records</h3>
                ${isAdmin ? `<button onclick="openAddForm('${type}')" class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition w-full sm:w-auto text-center"><i class="fa-solid fa-plus mr-1"></i> Add New ${type}</button>` : ''}
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr class="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                            <th class="py-3 px-3 md:px-4">#</th>
                            <th class="py-3 px-3 md:px-4">Name / Identifier</th>
                            <th class="py-3 px-3 md:px-4">Details</th>
                            <th class="py-3 px-3 md:px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml.length > 0 ? rowsHtml : `<tr><td colspan="4" class="text-center py-6 text-gray-400 text-sm">No records found.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 4. OPEN ADD FORM FOR MASTERS
async function openAddForm(type) {
    const content = document.getElementById('mainContent');
    let formTitle = `Create New ${type.toUpperCase()}`;
    let formFields = '';
    let apiEndpoint = '';

    if (type === 'branch') {
        apiEndpoint = '/api/broiler/branches';
        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Branch Name</label><input type="text" id="bName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Location</label><input type="text" id="bLoc" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Incharge</label><input type="text" id="bInc" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    } else if (type === 'user') {
        apiEndpoint = '/api/auth/register';
        let branchOpts = '<option value="">Select Branch</option>';
        try {
            const bRes = await fetch('/api/broiler/branches');
            const branches = await bRes.json();
            branches.forEach(b => branchOpts += `<option value="${b.name}">${b.name} (${b.location})</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input type="text" id="uName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" id="uEmail" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Password</label><input type="password" id="uPass" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Select Branch</label>
                <select id="uBranch" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${branchOpts}</select>
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Role</label><select id="uRole" class="w-full px-4 py-2.5 border rounded-lg text-sm"><option value="admin">Admin</option><option value="manager">Manager</option><option value="supervisor">Supervisor</option></select></div>
        `;
    } else if (type === 'farmer') {
        apiEndpoint = '/api/broiler/farmers';
        let supOpts = '<option value="">Select Supervisor</option>';
        try {
            const res = await fetch('/api/auth/users-list');
            const users = await res.json();
            users.forEach(u => supOpts += `<option value="${u._id}" data-branch="${u.branch || 'Main'}">${u.name} (${u.branch})</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Supervisor</label><select id="farmerSupervisor" required onchange="autoFillBranch(this)" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${supOpts}</select></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Branch (Auto)</label><input type="text" id="farmerBranch" readonly class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Farmer Name</label><input type="text" id="farmerName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label><input type="text" id="farmerPhone" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Village</label><input type="text" id="farmerVillage" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Shed Capacity</label><input type="number" id="farmerCapacity" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    } else if (type === 'trader') {
        apiEndpoint = '/api/broiler/traders';
        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Trader / Firm Name</label><input type="text" id="tName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label><input type="text" id="tPhone" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Market Area</label><input type="text" id="tArea" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    } else if (type === 'item') {
        apiEndpoint = '/api/broiler/items';
        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Item Name</label><input type="text" id="iName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Category</label><select id="iCat" class="w-full px-4 py-2.5 border rounded-lg text-sm"><option>Feed</option><option>Medicine</option><option>Chicks</option><option>Accessories</option></select></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Unit</label><input type="text" id="iUnit" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    }

    content.innerHTML = `
        <div class="max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 mx-auto">
            <div class="flex justify-between items-center mb-6 pb-3 border-b">
                <h3 class="text-base md:text-lg font-bold text-gray-800">${formTitle}</h3>
                <button onclick="loadMasterView('${type}')" class="text-gray-500 hover:text-gray-700 text-sm font-semibold"><i class="fa-solid fa-arrow-left"></i> Back</button>
            </div>
            <form id="addForm" class="space-y-4">
                ${formFields}
                <div class="pt-4 flex items-center justify-between">
                    <button type="submit" class="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition text-sm">Save Record</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('addForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let payload = {};
        if (type === 'branch') payload = { name: document.getElementById('bName').value, location: document.getElementById('bLoc').value, incharge: document.getElementById('bInc').value };
        else if (type === 'user') payload = { name: document.getElementById('uName').value, email: document.getElementById('uEmail').value, password: document.getElementById('uPass').value, branch: document.getElementById('uBranch').value, role: document.getElementById('uRole').value };
        else if (type === 'farmer') payload = { name: document.getElementById('farmerName').value, phone: document.getElementById('farmerPhone').value, village: document.getElementById('farmerVillage').value, shedCapacity: Number(document.getElementById('farmerCapacity').value), branch: document.getElementById('farmerBranch').value, supervisorId: document.getElementById('farmerSupervisor').value };
        else if (type === 'trader') payload = { name: document.getElementById('tName').value, phone: document.getElementById('tPhone').value, marketArea: document.getElementById('tArea').value };
        else if (type === 'item') payload = { name: document.getElementById('iName').value, category: document.getElementById('iCat').value, unit: document.getElementById('iUnit').value };

        try {
            const res = await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (res.ok) {
                alert("✅ Saved successfully!");
                loadMasterView(type);
            } else {
                alert("❌ Error: " + (result.message || result.error));
            }
        } catch (err) { alert("Network error!"); }
    });
}

// 5. ENTRY SECTION VIEW & SUBMISSION WITH LIST TABLE
async function loadEntryView(type) {
    const content = document.getElementById('mainContent');
    const title = document.getElementById('pageTitle');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    title.textContent = `${type.toUpperCase()} Transaction`;

    let formTitle = `New ${type.toUpperCase()} Entry`;
    let formFields = '';
    let apiEndpoint = '';
    let getEndpoint = '';

    if (type === 'chicks') {
        apiEndpoint = '/api/broiler/chicks-entry';
        getEndpoint = '/api/broiler/chicks-entry';
        let farmerOpts = '<option value="">Select Farmer</option>';
        try {
            const res = await fetch('/api/broiler/farmers');
            const farmers = await res.json();
            farmers.forEach(f => farmerOpts += `<option value="${f._id}">${f.name} (${f.branch}) - ${f.farmId}</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Farmer</label><select id="chicksFarmer" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${farmerOpts}</select></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Batch / Lot No</label>
                <input type="text" readonly value="System Auto-Generated on Submit (BATCH-001...)" class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-500 text-sm">
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Entry Date (Optional - Today if blank)</label><input type="date" id="entryDate" class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Chicks Quantity</label><input type="number" id="chicksQty" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Hatchery Name</label><input type="text" id="hatcheryName" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    } 
    else if (type === 'feed') {
        apiEndpoint = '/api/broiler/feed-request';
        getEndpoint = '/api/broiler/feed-request';
        let farmerOpts = '<option value="">Select Farmer</option>';
        let itemOpts = '<option value="">Select Feed Item</option>';
        try {
            const fRes = await fetch('/api/broiler/farmers');
            const farmers = await fRes.json();
            farmers.forEach(f => farmerOpts += `<option value="${f._id}">${f.name} (${f.branch})</option>`);

            const iRes = await fetch('/api/broiler/items');
            const items = await iRes.json();
            items.filter(i => i.category === 'Feed').forEach(i => itemOpts += `<option value="${i._id}">${i.name} (${i.unit})</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Farmer</label><select id="feedFarmer" required onchange="fetchBatchesForFarmer(this.value, 'batchContainer')" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${farmerOpts}</select></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Batch No</label>
                <div id="batchContainer">
                    <input type="text" readonly value="Select a farmer first" class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-400 text-sm">
                </div>
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Feed Item</label><select id="feedItem" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${itemOpts}</select></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Entry Date (Optional - Today if blank)</label><input type="date" id="entryDate" class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Quantity (Bags / Kg)</label><input type="number" id="feedQty" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    }
    else if (type === 'daily') {
        apiEndpoint = '/api/broiler/daily-entry';
        getEndpoint = '/api/broiler/daily-entry';
        let farmerOpts = '<option value="">Select Farmer</option>';
        try {
            const res = await fetch('/api/broiler/farmers');
            const farmers = await res.json();
            farmers.forEach(f => farmerOpts += `<option value="${f._id}">${f.name} (${f.branch})</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Farmer</label><select id="dailyFarmer" required onchange="fetchBatchesForFarmer(this.value, 'batchContainer')" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${farmerOpts}</select></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Batch No</label>
                <div id="batchContainer">
                    <input type="text" readonly value="Select a farmer first" class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-400 text-sm">
                </div>
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Entry Date (Optional - Today if blank)</label><input type="date" id="entryDate" onchange="updateCalculatedAge(document.getElementById('selectedBatchNo')?.value)" class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Age in Days (Auto Calculated)</label>
                <input type="number" id="ageDays" required class="w-full px-4 py-2.5 border rounded-lg bg-green-50 text-green-900 font-bold text-sm" placeholder="Auto calculated on batch select">
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Mortality (Dead Birds)</label><input type="number" id="mortality" value="0" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Feed Consumed (Kg)</label><input type="number" id="feedConsumed" value="0" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Body Weight (Gram)</label><input type="number" id="bodyWeight" value="0" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    }
    else if (type === 'sale') {
        apiEndpoint = '/api/broiler/sale-entry';
        getEndpoint = '/api/broiler/sale-entry';
        let farmerOpts = '<option value="">Select Farmer</option>';
        let traderOpts = '<option value="">Select Trader</option>';
        try {
            const fRes = await fetch('/api/broiler/farmers');
            const farmers = await fRes.json();
            farmers.forEach(f => farmerOpts += `<option value="${f._id}">${f.name} (${f.branch})</option>`);

            const tRes = await fetch('/api/broiler/traders');
            const traders = await tRes.json();
            traders.forEach(t => traderOpts += `<option value="${t._id}">${t.name} (${t.marketArea})</option>`);
        } catch(e) {}

        formFields = `
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Farmer (Source)</label><select id="saleFarmer" required onchange="fetchBatchesForFarmer(this.value, 'batchContainer')" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${farmerOpts}</select></div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Batch No</label>
                <div id="batchContainer">
                    <input type="text" readonly value="Select a farmer first" class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-400 text-sm">
                </div>
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Select Trader (Buyer)</label><select id="saleTrader" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${traderOpts}</select></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Sale Date (Optional - Today if blank)</label><input type="date" id="entryDate" class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Birds Count (Pcs)</label><input type="number" id="birdsCount" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Total Weight (Kg)</label><input type="number" step="0.01" id="totalWeight" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1">Rate Per Kg (₹)</label><input type="number" step="0.01" id="ratePerKg" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
        `;
    }

    let existingEntries = [];
    try {
        const res = await fetch(getEndpoint);
        existingEntries = await res.json();
    } catch(e) {}

    let rowsHtml = '';
    existingEntries.forEach((item, index) => {
        let farmerName = item.farmerId ? item.farmerId.name : 'N/A';
        let detailText = '';

        if (type === 'chicks') detailText = `Qty: ${item.quantity} | Hatchery: ${item.hatchery}`;
        else if (type === 'feed') detailText = `Item: ${item.itemId?.name || 'Feed'} | Qty: ${item.quantity}`;
        else if (type === 'daily') detailText = `Age: ${item.ageInDays} Days | Mort: ${item.mortality} | Feed: ${item.feedConsumedKg}kg`;
        else if (type === 'sale') detailText = `Trader: ${item.traderId?.name || 'N/A'} | Qty: ${item.birdsCount} pcs (${item.totalWeightKg}kg) | Amount: ₹${item.totalAmount}`;

        let entryDateFormatted = new Date(item.date || item.createdAt).toLocaleDateString('en-IN');

        rowsHtml += `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-3 text-xs text-gray-700">${index + 1}</td>
                <td class="py-3 px-3 text-xs font-semibold text-gray-900">${farmerName} <span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] ml-1 font-mono">${item.batchNo || ''}</span></td>
                <td class="py-3 px-3 text-xs text-gray-600">${detailText}</td>
                <td class="py-3 px-3 text-xs text-gray-500">${entryDateFormatted}</td>
                <td class="py-3 px-3 text-right">
                    ${isAdmin ? `
                        <button onclick="deleteTransaction('${type}', '${item._id}')" class="text-red-600 hover:text-red-800 text-xs font-semibold"><i class="fa-solid fa-trash"></i> Delete</button>
                    ` : `<span class="text-xs text-gray-400 italic">Saved</span>`}
                </td>
            </tr>
        `;
    });

    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Form Section -->
            <div class="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 class="text-base font-bold text-gray-800 mb-4 pb-2 border-b">${formTitle}</h3>
                <form id="entryForm" class="space-y-4">
                    ${formFields}
                    <div class="pt-4">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition text-sm">Submit Entry</button>
                    </div>
                </form>
            </div>

            <!-- List Section for Deletion -->
            <div class="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 class="text-base font-bold text-gray-800 mb-4 pb-2 border-b">Recent ${type.toUpperCase()} Records</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-100 text-gray-600 text-[11px] uppercase font-semibold">
                                <th class="py-2.5 px-3">#</th>
                                <th class="py-2.5 px-3">Farmer / Batch</th>
                                <th class="py-2.5 px-3">Details</th>
                                <th class="py-2.5 px-3">Date</th>
                                <th class="py-2.5 px-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml.length > 0 ? rowsHtml : `<tr><td colspan="5" class="text-center py-6 text-gray-400 text-xs">No entries found.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('entryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let payload = { branch: user.branch || 'Main' };

        const customDate = document.getElementById('entryDate').value;
        if (customDate) payload.date = customDate;

        if (type === 'chicks') {
            payload.farmerId = document.getElementById('chicksFarmer').value;
            payload.quantity = Number(document.getElementById('chicksQty').value);
            payload.hatchery = document.getElementById('hatcheryName').value;
        } else {
            const farmerElem = document.getElementById(type === 'feed' ? 'feedFarmer' : type === 'daily' ? 'dailyFarmer' : 'saleFarmer');
            const batchElem = document.getElementById('selectedBatchNo');
            
            if (!batchElem || !batchElem.value) {
                return alert("⚠️ Kripya valid batch select karein!");
            }

            payload.farmerId = farmerElem.value;
            payload.batchNo = batchElem.value;

            if (type === 'feed') {
                payload.itemId = document.getElementById('feedItem').value;
                payload.quantity = Number(document.getElementById('feedQty').value);
                payload.sentBy = user.id;
            } else if (type === 'daily') {
                payload.ageInDays = Number(document.getElementById('ageDays').value);
                payload.mortality = Number(document.getElementById('mortality').value);
                payload.feedConsumedKg = Number(document.getElementById('feedConsumed').value);
                payload.bodyWeightGm = Number(document.getElementById('bodyWeight').value);
                payload.recordedBy = user.id;
            } else if (type === 'sale') {
                payload.traderId = document.getElementById('saleTrader').value;
                payload.birdsCount = Number(document.getElementById('birdsCount').value);
                payload.totalWeightKg = Number(document.getElementById('totalWeight').value);
                payload.ratePerKg = Number(document.getElementById('ratePerKg').value);
                payload.soldBy = user.id;
            }
        }

        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (res.ok) {
                alert("✅ Entry saved successfully!");
                loadEntryView(type);
            } else {
                alert("❌ Error: " + (result.message || result.error));
            }
        } catch (err) { alert("Network error!"); }
    });
}


// 6. REPORT VIEWS GENERATION
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
    else if (reportType === 'farmer') {
        title.textContent = 'Farmer Ledger Report';
        let farmerOpts = '<option value="">Select Farmer</option>';
        try {
            const res = await fetch('/api/broiler/farmers');
            const farmers = await res.json();
            farmers.forEach(f => farmerOpts += `<option value="${f._id}">${f.name} (${f.branch}) - ${f.farmId}</option>`);
        } catch(e) {}

        content.innerHTML = `
            <div class="max-w-4xl bg-white p-6 rounded-xl shadow-sm border border-gray-200 mx-auto">
                <div class="mb-6 pb-3 border-b no-print">
                    <h3 class="text-lg font-bold text-gray-800">Generate Farmer & Batch Ledger</h3>
                    <p class="text-xs text-gray-500">Farmer select karein, phir batch chun kar poori report dekhein</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Select Farmer</label>
                        <select id="reportFarmerId" onchange="fetchBatchesForLedger(this.value)" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm font-medium">${farmerOpts}</select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Select Batch</label>
                        <select id="reportBatchNo" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm font-medium">
                            <option value="ALL">-- All Batches --</option>
                        </select>
                    </div>
                </div>
                <div class="text-right mb-4 no-print flex justify-end gap-3">
                    <button onclick="exportLedgerCSV()" class="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"><i class="fa-solid fa-file-excel mr-1"></i> Export to CSV</button>
                    <button onclick="generateFarmerLedger()" class="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition"><i class="fa-solid fa-file-invoice mr-1"></i> View Ledger Report</button>
                </div>
                <div id="farmerLedgerOutput"></div>
            </div>
        `;
    }
}

async function fetchBatchesForLedger(farmerId) {
    const batchSelect = document.getElementById('reportBatchNo');
    batchSelect.innerHTML = `<option value="ALL">-- All Batches --</option>`;
    if (!farmerId) return;

    try {
        const res = await fetch(`/api/broiler/farmer-batches/${farmerId}`);
        const batches = await res.json();
        batches.forEach(b => {
            batchSelect.innerHTML += `<option value="${b.batchNo}">Batch: ${b.batchNo} (Qty: ${b.quantity})</option>`;
        });
    } catch(e) {}
}

let activeLedgerData = null; // Store for CSV export

async function generateFarmerLedger() {
    const farmerId = document.getElementById('reportFarmerId').value;
    const batchNo = document.getElementById('reportBatchNo').value;
    const output = document.getElementById('farmerLedgerOutput');
    
    if (!farmerId) return alert("⚠️ Kripya pehle Farmer select karein!");

    output.innerHTML = `<div class="text-center py-6 text-gray-500">Loading ledger data...</div>`;

    try {
        const res = await fetch(`/api/broiler/reports/farmer-ledger/${farmerId}?batchNo=${batchNo}`);
        const data = await res.json();
        activeLedgerData = data; // Save data
        const { farmer, chicks, feeds, dailyLogs, sales } = data;

        // Calculations for Daily Logs Summary
        let totalPlacedChicks = chicks.reduce((sum, c) => sum + c.quantity, 0);
        let totalFeedIssued = feeds.reduce((sum, f) => sum + f.quantity, 0);
        let totalMortality = dailyLogs.reduce((sum, d) => sum + (d.mortality || 0), 0);
        let totalFeedConsumed = dailyLogs.reduce((sum, d) => sum + (d.feedConsumedKg || 0), 0);
        let closingFeed = totalFeedIssued - totalFeedConsumed;
        let mortalityPercent = totalPlacedChicks > 0 ? ((totalMortality / totalPlacedChicks) * 100).toFixed(1) : '0.0';

        // LATEST / MOST RECENT BODY WEIGHT (Aakhri entry ka body weight)
        let latestBodyWeight = 0;
        if (dailyLogs.length > 0) {
            // Sort by date or age in days descending to get the latest entry
            const sortedLogs = [...dailyLogs].sort((a, b) => (b.ageInDays || 0) - (a.ageInDays || 0));
            latestBodyWeight = sortedLogs[0].bodyWeightGm || 0;
        }
        
        let liveBirds = totalPlacedChicks - totalMortality;
        let totalBodyWeightKg = ((liveBirds * latestBodyWeight) / 1000).toFixed(2);

        // Total Sold Weight from Sales
        let totalSoldWeight = sales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
        let fcr = totalSoldWeight > 0 ? (totalFeedConsumed / totalSoldWeight).toFixed(2) : (totalBodyWeightKg > 0 ? (totalFeedConsumed / totalBodyWeightKg).toFixed(2) : '0.00');

        let chicksRows = chicks.map(c => `<tr><td class="p-2 border font-semibold">${c.batchNo}</td><td class="p-2 border">${c.quantity} Pcs</td><td class="p-2 border">${c.hatchery}</td><td class="p-2 border">${new Date(c.date).toLocaleDateString('en-IN')}</td></tr>`).join('');
        
        let feedRows = feeds.map(f => `<tr><td class="p-2 border font-semibold">${f.batchNo}</td><td class="p-2 border">${f.itemId?.name || 'Feed'}</td><td class="p-2 border text-blue-700 font-bold">${f.quantity} Kg</td><td class="p-2 border">${new Date(f.date).toLocaleDateString('en-IN')}</td></tr>`).join('');
        
        let dailyRows = dailyLogs.map(d => `<tr><td class="p-2 border font-semibold">${d.batchNo}</td><td class="p-2 border">Day ${d.ageInDays}</td><td class="p-2 border text-red-600 font-bold">${d.mortality} Pcs</td><td class="p-2 border text-blue-600">${d.feedConsumedKg} Kg</td><td class="p-2 border">${d.bodyWeightGm} gm</td><td class="p-2 border">${new Date(d.date).toLocaleDateString('en-IN')}</td></tr>`).join('');

        let saleRows = sales.map(s => `<tr><td class="p-2 border font-semibold">${s.batchNo}</td><td class="p-2 border">${s.traderId?.name || 'N/A'}</td><td class="p-2 border">${s.birdsCount} Pcs</td><td class="p-2 border">${s.totalWeightKg} Kg</td><td class="p-2 border">₹${s.ratePerKg}</td><td class="p-2 border font-bold text-green-700">₹${s.totalAmount}</td><td class="p-2 border">${new Date(s.date).toLocaleDateString('en-IN')}</td></tr>`).join('');

        output.innerHTML = `
            <div class="mt-6 border-t pt-6 bg-white p-4 rounded-xl">
                <div class="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <h4 class="text-base font-bold text-gray-900">${farmer.name}</h4>
                        <p class="text-xs text-gray-600 mt-0.5">Farm ID: <strong>${farmer.farmId}</strong> | Branch: <strong>${farmer.branch}</strong> | Phone: ${farmer.phone}</p>
                        <p class="text-xs text-purple-700 mt-1">Selected Batch Filter: <strong>${batchNo}</strong></p>
                    </div>
                    <button onclick="window.print()" class="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-xs font-semibold no-print"><i class="fa-solid fa-print mr-1"></i> Print Ledger</button>
                </div>

                <div class="space-y-6 text-xs">
                    <div>
                        <h5 class="font-bold text-gray-700 mb-2 uppercase border-b pb-1">1. Chicks Placement</h5>
                        <table class="w-full text-left border bg-white">${chicksRows || '<tr><td colspan="4" class="p-3 text-center text-gray-400">No chicks record found</td></tr>'}</table>
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-700 mb-2 uppercase border-b pb-1">2. Feed Issued (Godown Out)</h5>
                        <table class="w-full text-left border bg-white">${feedRows || '<tr><td colspan="4" class="p-3 text-center text-gray-400">No feed issue record found</td></tr>'}</table>
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-700 mb-2 uppercase border-b pb-1">3. Daily Logs (Mortality & Consumption)</h5>
                        <table class="w-full text-left border bg-white">${dailyRows || '<tr><td colspan="6" class="p-3 text-center text-gray-400">No daily logs found</td></tr>'}</table>
                        
                        <!-- Daily Logs Summary Box -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100 font-semibold text-gray-800">
                            <div>Total Mortality: <span class="text-red-600">${totalMortality} Pcs (${mortalityPercent}%)</span></div>
                            <div>Total Feed Consumed: <span class="text-blue-700">${totalFeedConsumed} Kg</span></div>
                            <div>Closing Feed: <span class="text-purple-700">${closingFeed >= 0 ? closingFeed : 0} Kg</span></div>
                            <div>Latest Body Weight: <span class="text-green-700">${latestBodyWeight} gm</span></div>
                            <div>Total Body Weight: <span class="text-green-800">${totalBodyWeightKg} Kg</span></div>
                            <div>FCR Ratio: <span class="text-amber-700 font-bold">${fcr}</span></div>
                        </div>
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-700 mb-2 uppercase border-b pb-1">4. Sale & Revenue Summary</h5>
                        <table class="w-full text-left border bg-white">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 font-semibold">
                                    <th class="p-2 border">Batch</th>
                                    <th class="p-2 border">Trader</th>
                                    <th class="p-2 border">Birds</th>
                                    <th class="p-2 border">Weight</th>
                                    <th class="p-2 border">Rate</th>
                                    <th class="p-2 border">Amount</th>
                                    <th class="p-2 border">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${saleRows || '<tr><td colspan="7" class="p-3 text-center text-gray-400">No sale records found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch(e) {
        output.innerHTML = `<div class="text-red-500 p-4">Error loading ledger data!</div>`;
    }
}

// 7. EXPORT LEDGER TO CSV (EXCEL)
function exportLedgerCSV() {
    if (!activeLedgerData || !activeLedgerData.farmer) {
        return alert("⚠️ Kripya pehle Ledger Generate karein!");
    }

    const { farmer, chicks, feeds, dailyLogs, sales } = activeLedgerData;
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += `Farmer Ledger Report\n`;
    csvContent += `Farmer Name,${farmer.name},Farm ID,${farmer.farmId},Branch,${farmer.branch}\n\n`;

    csvContent += `CHICKS PLACEMENT\nBatch No,Quantity,Hatchery,Date\n`;
    chicks.forEach(c => {
        csvContent += `${c.batchNo},${c.quantity},${c.hatchery},${new Date(c.date).toLocaleDateString('en-IN')}\n`;
    });

    csvContent += `\nFEED ISSUED\nBatch No,Item,Quantity,Date\n`;
    feeds.forEach(f => {
        csvContent += `${f.batchNo},${f.itemId?.name || 'Feed'},${f.quantity},${new Date(f.date).toLocaleDateString('en-IN')}\n`;
    });

    csvContent += `\nDAILY LOGS\nBatch No,Age,Mortality,Feed Consumed (Kg),Body Weight (gm),Date\n`;
    dailyLogs.forEach(d => {
        csvContent += `${d.batchNo},Day ${d.ageInDays},${d.mortality},${d.feedConsumedKg},${d.bodyWeightGm},${new Date(d.date).toLocaleDateString('en-IN')}\n`;
    });

    csvContent += `\nSALES SUMMARY\nBatch No,Trader,Birds,Weight (Kg),Rate,Amount,Date\n`;
    sales.forEach(s => {
        csvContent += `${s.batchNo},${s.traderId?.name || 'N/A'},${s.birdsCount},${s.totalWeightKg},${s.ratePerKg},${s.totalAmount},${new Date(s.date).toLocaleDateString('en-IN')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Farmer_Ledger_${farmer.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 8. DELETE TRANSACTION RECORD
async function deleteTransaction(type, id) {
    if (!confirm(`Kya aap is ${type.toUpperCase()} entry ko delete karna chahte hain?`)) return;

    let endpoint = `/api/broiler/${type}-entry/${id}`;
    if (type === 'feed') endpoint = `/api/broiler/feed-request/${id}`;

    try {
        const res = await fetch(endpoint, { method: 'DELETE' });
        if (res.ok) {
            alert("🗑️ Entry deleted successfully!");
            loadEntryView(type);
        } else {
            alert("❌ Failed to delete entry!");
        }
    } catch(err) { alert("Server error!"); }
}

// 9. DELETE MASTER RECORD
async function deleteRecord(type, id) {
    if (!confirm("Kya aap sach me is record ko delete karna chahte hain?")) return;
    let url = '';
    if (type === 'branch') url = `/api/broiler/branches/${id}`;
    else if (type === 'user') url = `/api/auth/users/${id}`;
    else if (type === 'farmer') url = `/api/broiler/farmers/${id}`;
    else if (type === 'trader') url = `/api/broiler/traders/${id}`;
    else if (type === 'item') url = `/api/broiler/items/${id}`;

    try {
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) {
            alert("🗑️ Deleted successfully!");
            loadMasterView(type);
        } else {
            alert("❌ Failed to delete!");
        }
    } catch(err) { alert("Server error!"); }
}

// 10. OPEN EDIT FORM FOR MASTERS
async function openEditModal(type, id) {
    let apiGet = '';
    if (type === 'branch') apiGet = `/api/broiler/branches`;
    else if (type === 'farmer') apiGet = `/api/broiler/farmers`;
    else if (type === 'trader') apiGet = `/api/broiler/traders`;
    else if (type === 'item') apiGet = `/api/broiler/items`;
    else if (type === 'user') apiGet = `/api/auth/users-list`;

    try {
        const res = await fetch(apiGet);
        const list = await res.json();
        const item = list.find(x => x._id === id);
        if (!item) return alert("Record not found!");

        const content = document.getElementById('mainContent');
        let formFields = '';

        if (type === 'branch') {
            formFields = `
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Branch Name</label><input type="text" id="editName" value="${item.name || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Location</label><input type="text" id="editLoc" value="${item.location || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Incharge</label><input type="text" id="editInc" value="${item.incharge || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            `;
        } else if (type === 'farmer') {
            let supOpts = '<option value="">Select Supervisor</option>';
            try {
                const uRes = await fetch('/api/auth/users-list');
                const users = await uRes.json();
                users.forEach(u => {
                    let sel = (item.supervisorId && (item.supervisorId._id === u._id || item.supervisorId === u._id)) ? 'selected' : '';
                    supOpts += `<option value="${u._id}" data-branch="${u.branch || 'Main'}" ${sel}>${u.name} (${u.branch})</option>`;
                });
            } catch(e) {}

            formFields = `
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Supervisor</label>
                    <select id="editFarmerSupervisor" required onchange="autoFillEditBranch(this)" class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${supOpts}</select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Branch (Auto)</label>
                    <input type="text" id="editFarmerBranch" value="${item.branch || ''}" readonly class="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-sm">
                </div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Farmer Name</label><input type="text" id="editName" value="${item.name || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label><input type="text" id="editPhone" value="${item.phone || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Village</label><input type="text" id="editVillage" value="${item.village || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Shed Capacity</label><input type="number" id="editCap" value="${item.shedCapacity || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            `;
        } else if (type === 'trader') {
            formFields = `
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Trader Name</label><input type="text" id="editName" value="${item.name || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Phone</label><input type="text" id="editPhone" value="${item.phone || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Market Area</label><input type="text" id="editArea" value="${item.marketArea || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            `;
        } else if (type === 'item') {
            formFields = `
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Item Name</label><input type="text" id="editName" value="${item.name || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Unit</label><input type="text" id="editUnit" value="${item.unit || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
            `;
        } else {
            let branchOpts = '';
            try {
                const bRes = await fetch('/api/broiler/branches');
                const branches = await bRes.json();
                branches.forEach(b => {
                    let sel = b.name === item.branch ? 'selected' : '';
                    branchOpts += `<option value="${b.name}" ${sel}>${b.name} (${b.location})</option>`;
                });
            } catch(e) {}

            let roles = ['admin', 'manager', 'supervisor'];
            let roleOpts = '';
            roles.forEach(r => {
                let rSel = r === item.role ? 'selected' : '';
                roleOpts += `<option value="${r}" ${rSel}>${r.toUpperCase()}</option>`;
            });

            formFields = `
                <div><label class="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input type="text" id="editName" value="${item.name || ''}" required class="w-full px-4 py-2.5 border rounded-lg text-sm"></div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
                    <select id="editBranch" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${branchOpts}</select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                    <select id="editRole" required class="w-full px-4 py-2.5 border rounded-lg bg-white text-sm">${roleOpts}</select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">New Password <span class="text-xs text-gray-400 font-normal">(Chhodein agar password nahi badalna hai)</span></label>
                    <input type="password" id="editPassword" placeholder="Enter new password if you want to change" class="w-full px-4 py-2.5 border rounded-lg text-sm">
                </div>
            `;
        }

        content.innerHTML = `
            <div class="max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 mx-auto">
                <div class="flex justify-between items-center mb-6 pb-3 border-b">
                    <h3 class="text-base md:text-lg font-bold text-gray-800">Edit ${type.toUpperCase()}</h3>
                    <button onclick="loadMasterView('${type}')" class="text-gray-500 hover:text-gray-700 text-sm font-semibold"><i class="fa-solid fa-arrow-left"></i> Back</button>
                </div>
                <form id="editForm" class="space-y-4">
                    ${formFields}
                    <div class="pt-4 flex items-center justify-between">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition text-sm">Update Record</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('editForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            let payload = {};
            let updateUrl = '';

            if (type === 'branch') {
                updateUrl = `/api/broiler/branches/${id}`;
                payload = { name: document.getElementById('editName').value, location: document.getElementById('editLoc').value, incharge: document.getElementById('editInc').value };
            } else if (type === 'farmer') {
                updateUrl = `/api/broiler/farmers/${id}`;
                payload = { 
                    name: document.getElementById('editName').value, 
                    phone: document.getElementById('editPhone').value, 
                    village: document.getElementById('editVillage').value, 
                    shedCapacity: Number(document.getElementById('editCap').value),
                    branch: document.getElementById('editFarmerBranch').value,
                    supervisorId: document.getElementById('editFarmerSupervisor').value
                };
            } else if (type === 'trader') {
                updateUrl = `/api/broiler/traders/${id}`;
                payload = { name: document.getElementById('editName').value, phone: document.getElementById('editPhone').value, marketArea: document.getElementById('editArea').value };
            } else if (type === 'item') {
                updateUrl = `/api/broiler/items/${id}`;
                payload = { name: document.getElementById('editName').value, unit: document.getElementById('editUnit').value };
            } else {
                updateUrl = `/api/auth/users/${id}`;
                payload = { 
                    name: document.getElementById('editName').value, 
                    branch: document.getElementById('editBranch').value,
                    role: document.getElementById('editRole').value,
                    password: document.getElementById('editPassword').value 
                };
            }

            try {
                const updateRes = await fetch(updateUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (updateRes.ok) {
                    alert("✅ Updated successfully!");
                    loadMasterView(type);
                } else {
                    alert("❌ Failed to update!");
                }
            } catch(err) { alert("Server error!"); }
        });

    } catch (err) { alert("Error loading record for edit!"); }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    renderLogin();
}

checkAuth();
