const bcrypt = require('bcryptjs');

async function test() {
    try {
        console.log("Testing bcryptjs...");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("password123", salt);
        const match = await bcrypt.compare("password123", hash);
        console.log("Match:", match);
        console.log("Bcryptjs is working perfectly.");
    } catch (e) {
        console.error("Bcryptjs failed:", e);
    }
}
test();
