# Environment Variables

```env
BASEURL=https://staging-api.kinggroup44.com
AUTHGUARD=false
REDIRECTURL=https://example.com/login
FACEBOOK_URL=https://facebook.com/
YOUTUBE_URL=https://youtube.com/
INSTAGRAM_URL=https://instagram.com/
TWITTER_URL=https://twitter.com/
```
In production 
Turn on AUTHGUARD to True

REDIRECTURL the url site will be redirect 

# Test
Member login 
Add this parameter in the end of main url
auth?id=12345&o=kinggroup44.com

http://192.168.0.130:3000/auth?id=12345&o=kinggroup44.com


# Run

```bash
npm run build
npm run dev
```
