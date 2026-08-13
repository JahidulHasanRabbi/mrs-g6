# Environment Variables

```env
NEXT_PUBLIC_BASEURL=https://staging-api.kinggroup44.com
NEXT_PUBLIC_AUTHGUARD=false

# Social Media URLs
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/addlist/HlimM6bYfqo1MWQ1
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/
```

**In production:** Set `NEXT_PUBLIC_AUTHGUARD=true` to enable authentication guard.

---

# Authentication

## Login URL Format
```
/auth?id=<member_id>&o=<redirect_domain>&page=<target_page>
```

### Parameters:
- **`id`** (required): Member ID for authentication
- **`o`** (required): External domain to redirect to on auth failure or token expiry
- **`page`** (optional): Internal page to navigate after successful login

### Available Pages:
- `/` - Homepage (default)
- `/profile` - User profile
- `/spin` - Lucky spin
- `/penalty-kick` - Penalty kick
- `/mart` - Redemption mart
- `/personal-data` - Personal data form
- `/vip` - VIP tier details
- `/terms-and-conditions` - Terms and conditions

### Examples:
```bash
# Login and go to homepage
http://localhost:3000/auth?id=12345&o=kinggroup44.com

# Login and go to profile page
updatedhttp://localhost:3000/auth?id=12345&o=kinggroup44.com&page=/profile

# Login and go to spin page
http://localhost:3000/auth?id=12345&o=kinggroup44.com&page=/spin

# Login and go to penalty kick page
http://localhost:3000/auth?id=12345&o=kinggroup44.com&page=/penalty-kick

# Login and go to terms and conditions
http://localhost:3000/auth?id=12345&o=kinggroup44.com&page=/terms-and-conditions
```

### How It Works:
1. User visits auth URL with `id`, `o`, and optional `page`
2. System saves `o` to localStorage (for future redirects)
3. API generates authentication token
4. **Success:** Redirects to `page` (or `/` if not provided)
5. **Failure:** Redirects to `o` domain
6. **Token expires later:** Redirects to saved `o` domain

---


# Run

```bash
npm run dev    # Development mode
npm run build  # Build for production
npm start      # Production mode

adsfa
updated
