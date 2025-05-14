# Conversation Web App Template
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Config App
Create a file named `.env.local` in the current directory and copy the contents from `.env.example`. Setting the following content:
```
# APP ID: This is the unique identifier for your app. You can find it in the app's detail page URL. 
# For example, in the URL `https://cloud.dify.ai/app/xxx/workflow`, the value `xxx` is your APP ID.
NEXT_PUBLIC_APP_ID=

# APP API Key: This is the key used to authenticate your app's API requests. 
# You can generate it on the app's "API Access" page by clicking the "API Key" button in the top-right corner.
NEXT_PUBLIC_APP_KEY=

# APP URL: This is the API's base URL. If you're using the Dify cloud service, set it to: https://api.dify.ai/v1.
NEXT_PUBLIC_API_URL=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db

# Admin Setup Key (recommended to change in production)
ADMIN_SECRET_KEY=your-secure-admin-key
```

Config more in `config/index.ts` file:   
```js
export const APP_INFO: AppInfo = {
  title: 'Chat APP',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'zh-Hans'
}

export const isShowPrompt = true
export const promptTemplate = ''
```

## Getting Started
First, install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```

### Database Setup

This application uses PostgreSQL with Prisma ORM for database management.

#### Option 1: Use Docker (Recommended)

The easiest way to set up the database is to use Docker:

```bash
# Start PostgreSQL database
docker-compose up -d postgres
```

#### Option 2: Use local PostgreSQL

If you have PostgreSQL installed locally, create a database:

```bash
createdb auth_db
```

### Initialize the Database

Run the database initialization script:

```bash
# Make script executable
chmod +x scripts/init-db.sh

# Run the script
./scripts/init-db.sh
```

This will:
1. Create a `.env.local` file if it doesn't exist
2. Set up the database tables
3. Generate the Prisma client

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## First-time Setup: Creating an Admin Account

When you first set up the application, you'll need to create an admin account:

1. Start your application and navigate to: http://localhost:3000/admin-setup
2. Fill in the following information:
   - Email: Your admin email address
   - Password: Create a strong password
   - Admin Key: Use `admin-setup-123456` (default) or the value you set in ADMIN_SECRET_KEY

This page allows you to:
- Create a new admin user if the email doesn't exist
- Convert an existing user to an admin and activate their account

> **Security Note:** For production environments, change the default admin secret key by setting the `ADMIN_SECRET_KEY` environment variable.

## Using the Admin Interface

After creating an admin account:

1. Log in with your admin credentials
2. Access the admin interface to:
   - Manage users: Assign roles, activate/deactivate accounts, reset passwords
   - Manage roles: Create, edit, or disable roles

## Using Docker

```
docker build . -t <DOCKER_HUB_REPO>/webapp-conversation:latest
# now you can access it in port 3000
docker run -p 3000:3000 <DOCKER_HUB_REPO>/webapp-conversation:latest
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Using Docker Compose

Make sure you have an `.env` file in your project root with the required variables as described in the Config App section.

Run the application using Docker Compose:

```bash
# Start the application in detached mode
docker-compose up -d

# View logs while the container is running
docker-compose logs -f

# Stop the container
docker-compose down
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication System

This application includes a complete authentication system using NextAuth.js with PostgreSQL:

- User registration with password hashing
- Email/password authentication
- Session management with JWT
- Extensible for OAuth providers (Google, GitHub, etc.)
- Role-based access control (RBAC)
- User account activation workflow

### User Registration Flow

1. Users register through the registration page
2. New accounts are inactive by default
3. Admin assigns a role and activates the account
4. User can now log in

### Database Access

To inspect the database:

```bash
# Using Prisma Studio
npx prisma studio

# Direct PostgreSQL access
psql -h localhost -U postgres -d auth_db
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

> ⚠️ If you are using [Vercel Hobby](https://vercel.com/pricing), your message will be truncated due to the limitation of vercel.


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Prompt

添加登录和RBAC功能
```
good job， 现在注册和登录功能都实现了，下一步我们来实现管理员界面，管理员界面只能由admin账号登录查看，管理员负责两部分的职责：用户管理/ROLE管理。管理员如何管理ROLE： 管理员可以新增/修改/删除/禁用/启用ROLE, 已经确定的三个ROLE是 GEB/ERA/General, 需要预置在ROLE表中。管理员如何管理用户：用户在注册页面注册账户后，此账户默认为禁用状态，管理员登录管理界面后，首先应该分配ROLE的角色给这个新账户，然后启动此账户，此外管理员还可以重置用户账户密码，禁用或者启用账户.
```


