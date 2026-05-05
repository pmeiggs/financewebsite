edit .env.example with your credentials for it to work and rename it to .env.local
Requirements:
this app is made for XAMPP with MySQL running
Node.js must be installed for it to run


you can generate a JWT key running: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" and using that
as your key, you can run this inside a console or the vscode terminal after pnpm install has been run

instructions:

1. create a connection to MySQL and run database/schema.sql
after this test users will be created but you can go ahead and register yourself after follwing the instructions
to the end
2. create a new terminal
3. cd into the right folder (the one that has package.json)
4. pnpm install
5. pnpm dev (for dev mode)
6. Open http://localhost:3000 in your browser, if port 3000 is already in use check nextjs output in terminal for port
7. Use logins already made or create a new account — credentials in database/schema.sql

if you close terminal where you ran pnpm dev youll have to follow steps 2-5 again then refresh browser or go into the
port nextjs output tells you in the terminal

example of output:
   ▲ Next.js 15.5.15
   - Local:        http://localhost:3000
   - Network:      http://10.5.0.2:3000
   - Environments: .env.local

