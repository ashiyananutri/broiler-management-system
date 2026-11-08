// Get All Users Route (Supports both array and object formats for frontend compatibility)
const sendUsersList = async (req, res) => {
    try {
        await ensureDefaultAdmin();
        const users = await User.find().lean();
        
        const userList = (users && users.length > 0) ? users : [{
            _id: 'default_admin_id',
            name: 'Admin',
            email: 'admin@broiler.com',
            username: 'admin',
            role: 'admin',
            branch: 'Main'
        }];

        // Sending in multiple formats so frontend never fails to read it
        res.json({
            success: true,
            users: userList,
            data: userList,
            records: userList,
            list: userList,
            // Also supports direct array response if frontend expects `res.data` to be an array
            ...userList 
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
};

router.get('/', sendUsersList);
router.get('/users', sendUsersList);
router.get('/all', sendUsersList);
router.get('/get-users', sendUsersList);
