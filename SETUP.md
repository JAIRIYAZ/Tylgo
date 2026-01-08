# Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be fully provisioned (takes 1-2 minutes)

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify that all tables were created by going to **Table Editor**

You should see these tables:
- `companies`
- `users`
- `tiles`
- `quotations`
- `quotation_items`

### 4. Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public** key

### 5. Create Environment File

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `your-project-id` with your actual Supabase project ID
- `your-anon-key-here` with your actual anon key

### 6. Configure Storage (Optional - for tile images)

If you want to upload tile images to Supabase Storage:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `tile-images`
3. Set it to **Public bucket**
4. Update the image upload functionality in `ManageTilesPage.tsx` if needed

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 8. Test the Application

1. **Sign Up**: Create a new account (this creates a company)
2. **Add Tiles**: As admin, go to "Manage Tiles" and add some tiles
3. **Browse Tiles**: Go to "Tiles" to see your tiles
4. **Add to Cart**: Click on a tile and add it to cart
5. **Create Quotation**: Go to cart and create a quotation
6. **Add Worker**: As admin, go to "Manage Workers" and add a worker account

## Troubleshooting

### Database Connection Issues

- Verify your `.env` file has the correct Supabase URL and key
- Make sure you ran the SQL schema script
- Check that RLS policies are enabled (they should be created by the schema script)

### Authentication Issues

- Make sure email confirmation is disabled in Supabase Auth settings (for development)
- Go to **Authentication** → **Settings** → **Email Auth** → Disable "Confirm email"

### RLS Policy Issues

- If you can't see data, check that the RLS policies were created correctly
- Verify your user has the correct `company_id` in the `users` table

### Build Issues

- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed: `rm -rf node_modules && npm install`

## Production Deployment

### Environment Variables

Make sure to set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Command

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider.

## Security Notes

- The `anon` key is safe to expose in the frontend (it's protected by RLS)
- Never expose your `service_role` key in the frontend
- RLS policies ensure users can only access their company's data
