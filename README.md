# Environment Variables

```env
NEXT_PUBLIC_BASEURL=https://staging-api.kinggroup44.com
NEXT_PUBLIC_AUTHGUARD=false
NEXT_PUBLIC_REDIRECTURL=https://example.com/login

# Social Media URLs
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/addlist/HlimM6bYfqo1MWQ1
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/
```
In production 
Turn on AUTHGUARD to True

REDIRECTURL the url site will be redirect

# Test
Member login 
Add this parameter in the end of main url
auth?id=<id>>&o=<string>

http://192.168.0.130:3000/auth?id=12345&o=kinggroup44.com


# Run

```bash
npm run build
npm run dev
```
