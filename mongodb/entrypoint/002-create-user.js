const PASSWORD_FILE = `/tmp/secrets/${process.env.MONGODB_CUSTOM_USERNAME}-password`;

if (db.getUsers().users.length === 0) {
  console.log('Creating user');
  let password = fs.readFileSync(PASSWORD_FILE).toString().trim();
  let createUser = {
    user: process.env.MONGODB_CUSTOM_USERNAME,
    pwd: password,
    roles: [
      {
        role: 'root',
        db: 'admin',
      },
    ],
  };
  db.createUser(createUser);
} else {
  console.log('User already exists');
}
