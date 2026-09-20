const fs = require("fs");

const users = [];

for (let i = 1; i <= 500; i++) {

    users.push({
        rollNo: `TEST${String(i).padStart(3, "0")}`
    });

}

fs.writeFileSync(
    "./users.json",
    JSON.stringify(users, null, 2)
);

console.log("Generated", users.length, "test users");