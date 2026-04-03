Supabase notes
==============

Connection string (recommended for this Node API)
-------------------------------------------------
In Supabase: Project Settings → Database → Connection string → URI.

Prefer the "Direct connection" (host looks like db.<project-ref>.supabase.co, port 5432).
Transaction pooler (port 6543, pooler.supabase.com) can cause issues with some clients; use it only if you intend to.

Schema alignment
-----------------
This app expects your Supabase tables to match the UUID/_id design (Users, Projects, Tasks with assignedTo, Feedbacks with createdBy, etc.).

If your "Users" table was created without leave-balance columns, run once in the SQL Editor:

  server/sql/add_user_leave_columns.sql

Leave balance columns (totalLeaves, usedLeaves) are required for leave approval logic.

Sample data
-----------
After the API connects successfully, sample rows are inserted automatically on first start if the Users table is empty.

You can also run manually from the server folder:

  npm run seed

Logins (password is always "password" for seeded users):
  admin@example.com
  manager@example.com
  alice@example.com
  bob@example.com
