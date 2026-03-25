# Table of Contents {#table-of-contents}

[**Table of Contents	1**](#table-of-contents)

[**Changelog	3**](#changelog)

[**Initial Setup of MRS	4**](#initial-setup-of-mrs)

[Base Domain	4](#base-domain)

[Developer Access	4](#developer-access)

[**ADMIN PAGE	5**](#admin-page)

[MEMBER VIP TIER	5](#member-vip-tier)

[/member/vip-tier/ GET	5](#/member/vip-tier/-get)

[/member/vip-tier/ POST	5](#/member/vip-tier/-post)

[/member/vip-tier/{tier\_uuid}/ PUT	5](#/member/vip-tier/{tier_uuid}/-put)

[**USER PAGE	7**](#user-page)

[MEMBER LOGIN FROM EXTERNAL	7](#member-login-from-external)

[/login/generate-token/ POST	7](#/login/generate-token/-post)

[HOME PAGE	8](#home-page)

[Checkin	8](#checkin)

[/member/members/check-in/ POST	8](#/member/members/check-in/-post)

[Welcome Gift	8](#welcome-gift)

[/member/members/welcome/ POST	8](#/member/members/welcome/-post)

[Member Info	8](#member-info)

[/member/members/{member\_uuid}/ GET	8](#/member/members/{member_uuid}/-get)

[LUCKY SPIN	9](#lucky-spin)

[Spins	9](#spins)

[/member/\<member\_uuid\>/one-spin/ POST	9](#/member/\<member_uuid\>/one-spin/-post)

[/member/\<member\_uuid\>/ten-spin/ POST	9](#/member/\<member_uuid\>/ten-spin/-post)

[/member/\<member\_uuid\>/fifty-spin/ POST	9](#/member/\<member_uuid\>/fifty-spin/-post)

[/member/\<member\_uuid\>/hundred-spin/ POST	9](#/member/\<member_uuid\>/hundred-spin/-post)

[**PROFILE PAGE	10**](#profile-page)

[Personal data page	10](#personal-data-page)

[/member/profile/\<member\_uuid\>/ GET	10](#/member/profile/\<member_uuid\>/-get)

[/member/profile/\<member\_uuid\>/update-profile/ PATCH	10](#/member/profile/\<member_uuid\>/update-profile/-patch)

[**LUCKY MART \- REDEMPTION	12**](#lucky-mart---redemption)

[Redemption items / redeem	12](#redemption-items-/-redeem)

[/redemption/redemption-items/ GET	12](#/redemption/redemption-items/-get)

[/redemption/redemption-items/available-items/ GET	12](#/redemption/redemption-items/available-items/-get)

[/redemption/redemption-items/{uuid}/redeem/ POST	12](#/redemption/redemption-items/{uuid}/redeem/-post)

[**BACK OFFICE	14**](#back-office)

[**Logins	14**](#logins)

[Login \- Admin Access Token	14](#login---admin-access-token)

[/login/admin-access-token/ POST	14](#/login/admin-access-token/-post)

[Login \- Logout	14](#login---logout)

[/login/logout/ POST	14](#/login/logout/-post)

[Login \- Refresh Token	14](#login---refresh-token)

[/login/refresh-token/ POST	14](#/login/refresh-token/-post)

[Login \- Verify Token	14](#login---verify-token)

[/login/verify-token/ POST	14](#/login/verify-token/-post)

[Lucky Spin Management	16](#lucky-spin-management)

[Lucky Spin Items	16](#lucky-spin-items)

[/lucky-spin/lucky-spin-items/ \- GET	16](#/lucky-spin/lucky-spin-items/---get)

[/lucky-spin/lucky-spin-items/{uuid}/ \- GET	16](#/lucky-spin/lucky-spin-items/{uuid}/---get)

[Lucky Spin Items \- POST and PUT	16](#lucky-spin-items---post-and-put)

[/lucky-spin/lucky-spin-items/ \- POST	16](#/lucky-spin/lucky-spin-items/---post)

[/lucky-spin/lucky-spin-items/{uuid}/ \- PUT	16](#/lucky-spin/lucky-spin-items/{uuid}/---put)

[/lucky-spin/lucky-spin-items/{uuid}/archive/ \- PATCH	17](#/lucky-spin/lucky-spin-items/{uuid}/archive/---patch)

[**Lucky Spin Sequence	17**](#lucky-spin-sequence)

[Lucky Spin Sequence \- GET	17](#lucky-spin-sequence---get)

[/lucky-spin/lucky-spin-sequences/ \- GET	17](#/lucky-spin/lucky-spin-sequences/---get)

[/lucky-spin/lucky-spin-sequences/{uuid}/ \- GET	17](#/lucky-spin/lucky-spin-sequences/{uuid}/---get)

[Lucky Spin Sequences \- POST	18](#lucky-spin-sequences---post)

[/lucky-spin/lucky-spin-sequences/ \- POST	18](#/lucky-spin/lucky-spin-sequences/---post)

[Lucky Spin Sequences \- DELETE	18](#lucky-spin-sequences---delete)

[/lucky-spin/lucky-spin-sequences/{uuid}/ \- DELETE	18](#/lucky-spin/lucky-spin-sequences/{uuid}/---delete)

[Lucky Spin Sequences ORDER \- PATCH	18](#lucky-spin-sequences-order---patch)

[/lucky-spin/lucky-spin-sequences/change-spin-sequences/ \- PATCH	18](#/lucky-spin/lucky-spin-sequences/change-spin-sequences/---patch)

[**Members	19**](#members)

[/member/members/ GET	19](#/member/members/-get)

[LUCKY MART \- Redemption Items	20](#lucky-mart---redemption-items)

[/redemption/redemption-items/ GET	20](#/redemption/redemption-items/-get-1)

[/redemption/redemption-items/ POST	20](#/redemption/redemption-items/-post)

[/redemption/redemption-items/{uuid}/ PUT	20](#/redemption/redemption-items/{uuid}/-put)

[/redemption/redemption-items/{uuid}/archive/ PATCH	21](#/redemption/redemption-items/{uuid}/archive/-patch)

[Checkin \- Settings	22](#checkin---settings)

[/settings/checkin-settings/ GET	22](#/settings/checkin-settings/-get)

[/settings/checkin-settings/ POST	22](#/settings/checkin-settings/-post)

# Changelog {#changelog}

| Date | Changes Made | Modules |
| :---- | :---- | :---- |
| 2026/03/09 | Added check in settings | Modules:Settings \- Checkin Settings |
| 2026/01/19 | Added Welcome Gift Added Promotion to Redemption item | Modules:Member \- Welcome Gift Redemption \- Redemption Item |
| 2025/12/23 | Added Member VIp Tier | Modules:Admin Page \- VIP Tiers Member \- Vip Badge Page |
| 2025/12/01 | Initial Changelog |  |

# Initial Setup of MRS {#initial-setup-of-mrs}

### Base Domain {#base-domain}

Staging: staging-api.kinggroup44.com

### Developer Access {#developer-access}

Username: Admin1  
Password: Qwerabcd\!

Token Login:  
id: anything for now  
o: kinggroup44.com

# ADMIN PAGE {#admin-page}

## MEMBER VIP TIER {#member-vip-tier}

### /member/vip-tier/ GET {#/member/vip-tier/-get}

Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | id | Int |  |
| **2** | uuid | UUID |  |
| **3** | name | Str |  |
| **4** | lifetime\_deposit\_required | Str(Decimal) |  |
| **5** | monthly\_deposit | Str(Decimal) |  |
| **6** | upgrade\_bonus | Str(Decimal) |  |
| **7** | monthly\_loyalty\_bonus | Str(Decimal) |  |
| **8** | birthday\_bonus | Str(Decimal) |  |

### /member/vip-tier/ POST {#/member/vip-tier/-post}

### /member/vip-tier/{tier\_uuid}/ PUT {#/member/vip-tier/{tier_uuid}/-put}

Input

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | name | Str |  |
| **2** | lifetime\_deposit\_required | Str(Decimal) |  |
| **3** | monthly\_deposit | Str(Decimal) |  |
| **4** | upgrade\_bonus | Str(Decimal) |  |
| **5** | monthly\_loyalty\_bonus | Str(Decimal) |  |
| **6** | birthday\_bonus | Str(Decimal) |  |

/member/vip-tier/{tier\_uuid}/archive/ PATCH

# USER PAGE {#user-page}

## MEMBER LOGIN FROM EXTERNAL {#member-login-from-external}

#### /login/generate-token/ POST {#/login/generate-token/-post}

Input

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | id | Int |  |
| **2** | o | String | (These are given by third party, where o is the domain) |

Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | access | String |  |
| **2** | refresh | String |  |
| **3** | member\_uuid | UUID |  |
| **4** | tokens\_obtained | Int |  |

## HOME PAGE {#home-page}

### Checkin {#checkin}

#### /member/members/check-in/ POST {#/member/members/check-in/-post}

### Welcome Gift {#welcome-gift}

#### /member/members/welcome/ POST {#/member/members/welcome/-post}

### Member Info {#member-info}

#### /member/members/{member\_uuid}/ GET {#/member/members/{member_uuid}/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | phone\_number | Str | No |  |
| **4** | username | Str | No |  |
| **5** | tier | Str | No |  |
| **5a** | tier\_id | UUID | No |  |
| **6** | current\_tokens | Str | No |  |
| **7** | last\_check\_in\_date | Date | Yes |  |
| **8** | last\_login\_datetime | DateTime | Yes |  |
| **9** | total\_deposit | Str(Decimal) | No |  |

## LUCKY SPIN {#lucky-spin}

### Spins {#spins}

#### /member/\<member\_uuid\>/one-spin/ POST {#/member/<member_uuid>/one-spin/-post}

#### /member/\<member\_uuid\>/ten-spin/ POST {#/member/<member_uuid>/ten-spin/-post}

#### /member/\<member\_uuid\>/fifty-spin/ POST {#/member/<member_uuid>/fifty-spin/-post}

#### /member/\<member\_uuid\>/hundred-spin/ POST {#/member/<member_uuid>/hundred-spin/-post}

Response  
(Will be in a list for multiple spins)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | reward\_name | Str | No |  |
| **3** | image | Image | No |  |

# 

# PROFILE PAGE {#profile-page}

### Personal data page {#personal-data-page}

#### /member/profile/\<member\_uuid\>/ GET {#/member/profile/<member_uuid>/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | full\_name | str | Yes |  |
| **4** | email | str(email) | Yes |  |
| **5** | date\_of\_birth | date | Yes |  |
| **6** | gender | str | Yes |  |
| **7** | hobby | str | Yes |  |
| **8** | free\_token\_flag | bool | \- | False if tokens is unclaimed, True if tokens are claimed |

#### /member/profile/\<member\_uuid\>/update-profile/ PATCH {#/member/profile/<member_uuid>/update-profile/-patch}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | full\_name | str | Yes |  |
| **2** | email | str(email) | Yes |  |
| **3** | date\_of\_birth | date | Yes |  |
| **4** | gender | Int (Enum) | Yes | 1 \- Male 2 \- Female 3 \- Prefer not to say |
| **5** | hobby | Int (Enum) | Yes | 1 \- Reading 2 \- Cooking / Baking 3 \- Travelling 4 \- Music 5 \- Gaming 6 \- Sports 7 \- Gardening 8 \- Photography 9 \- Art 10 \- Crafting 11 \- Watching Videos 12 \- Dancing 13 \- Hiking 14 \- Writing 15 \- Animal Care |

# LUCKY MART \- REDEMPTION {#lucky-mart---redemption}

### Redemption items / redeem {#redemption-items-/-redeem}

#### /redemption/redemption-items/ GET {#/redemption/redemption-items/-get}

#### /redemption/redemption-items/available-items/ GET {#/redemption/redemption-items/available-items/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | quantity\_available | int | No |  |
| **4** | start\_date | date | No |  |
| **5** | end\_date | date | No |  |
| **6** | prize\_type | str | No |  |
| **7** | credit\_amount | int | Yes | Required if prize\_type is Credit, else not required |
| **8** | tokens\_needed | int | No |  |
| **9** | promotion | str(Decimal) | No |  |
| **10** | image | Image | Yes |  |

#### /redemption/redemption-items/{uuid}/redeem/ POST {#/redemption/redemption-items/{uuid}/redeem/-post}

(uuid is item uuid)  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | member\_uuid | uuid | No |  |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | details | str | No | Provides error message if necessary |

# 

# BACK OFFICE {#back-office}

## Logins {#logins}

### Login \- Admin Access Token {#login---admin-access-token}

#### /login/admin-access-token/ POST {#/login/admin-access-token/-post}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | email | String |  |
| **2** | password | String |  |

### Login \- Logout {#login---logout}

#### /login/logout/ POST {#/login/logout/-post}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | refresh | String |  |

### Login \- Refresh Token {#login---refresh-token}

#### /login/refresh-token/ POST {#/login/refresh-token/-post}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | refresh | String |  |

### Login \- Verify Token {#login---verify-token}

Used to make sure that tokens are still valid, not as a login method

#### /login/verify-token/ POST {#/login/verify-token/-post}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | token | String | The access token, not the refresh token |

Response  
If it’s valid, it return an empty object \- {}  
If it’s not valid, it returns 401 unauthorized

# 

## Lucky Spin Management {#lucky-spin-management}

### Lucky Spin Items {#lucky-spin-items}

#### /lucky-spin/lucky-spin-items/ \- GET {#/lucky-spin/lucky-spin-items/---get}

#### /lucky-spin/lucky-spin-items/{uuid}/ \- GET {#/lucky-spin/lucky-spin-items/{uuid}/---get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | reward\_name | String | No |  |
| **4** | unlimited | Bool | No |  |
| **5** | quantity | Int | No |  |
| **6** | image | String (Image) | Yes |  |
| **7** | item\_type | String | No |  |
| **8** | min\_withdraw | Decimal | Yes | To only show if item\_type \== Free Credit |
| **9** | max\_withdraw | Decimal | Yes | To only show if item\_type \== Free Credit |
| **10** | multiplier | Int | Yes | To only show if item\_type \== Free Credit |
| **11** | token\_amount | Int | Yes | To only show if item\_type \== Token |

### Lucky Spin Items \- POST and PUT {#lucky-spin-items---post-and-put}

#### /lucky-spin/lucky-spin-items/ \- POST {#/lucky-spin/lucky-spin-items/---post}

#### /lucky-spin/lucky-spin-items/{uuid}/ \- PUT {#/lucky-spin/lucky-spin-items/{uuid}/---put}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | reward\_name | String | No |  |
| **2** | unlimited | Bool | No |  |
| **3** | quantity | Int | ? | If unlimited is True, nullable.If unlimited is False, not nullable. |
| **4** | image | String (Image) | Yes |  |
| **5** | item\_type | Int | No | Look at Lucky Spin Item Type Enum Below |
| **6** | min\_withdraw | Decimal | No | To only input if item\_type \== Free Credit |
| **7** | max\_withdraw | Decimal | No | To only input if item\_type \== Free Credit |
| **8** | multiplier | Int | No | To only input if item\_type \== Free Credit |
| **9** | token\_amount | Int | No | To only input if item\_type \== Token |

### 

| ID | Lucky Spin Item Type |
| ----- | ----- |
| 1 | Free Credit |
| 2 | Item |
| 3 | Token |
| 4 | Other |

#### /lucky-spin/lucky-spin-items/{uuid}/archive/ \- PATCH {#/lucky-spin/lucky-spin-items/{uuid}/archive/---patch}

## Lucky Spin Sequence {#lucky-spin-sequence}

### Lucky Spin Sequence \- GET {#lucky-spin-sequence---get}

#### /lucky-spin/lucky-spin-sequences/ \- GET {#/lucky-spin/lucky-spin-sequences/---get}

#### /lucky-spin/lucky-spin-sequences/{uuid}/ \- GET {#/lucky-spin/lucky-spin-sequences/{uuid}/---get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | item\_order | Int | No |  |
| **4** | item\_name | Str | No |  |
| **5** | item\_uuid | UUID | No |  |

### Lucky Spin Sequences \- POST {#lucky-spin-sequences---post}

#### /lucky-spin/lucky-spin-sequences/ \- POST {#/lucky-spin/lucky-spin-sequences/---post}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | item\_order | Int | No |  |
| **2** | item\_uuid | UUID | No |  |

### Lucky Spin Sequences \- DELETE {#lucky-spin-sequences---delete}

#### /lucky-spin/lucky-spin-sequences/{uuid}/ \- DELETE {#/lucky-spin/lucky-spin-sequences/{uuid}/---delete}

### Lucky Spin Sequences ORDER \- PATCH {#lucky-spin-sequences-order---patch}

#### /lucky-spin/lucky-spin-sequences/change-spin-sequences/ \- PATCH {#/lucky-spin/lucky-spin-sequences/change-spin-sequences/---patch}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | lucky\_spins | List | \- | List of items below |

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | item\_order | Int | No |  |
| **2** | sequence\_UUID | UUID | No |  |

## Members {#members}

### /member/members/ GET {#/member/members/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | phone\_number | Str | No |  |
| **4** | username | Str | No |  |
| **5** | tier | Str | No |  |
| **6** | current\_tokens | Int | No |  |
| **7** | last\_check\_in\_date | Date | Yes |  |
| **8** | last\_login\_datetime | DateTime | Yes |  |

### 

## LUCKY MART \- Redemption Items {#lucky-mart---redemption-items}

#### /redemption/redemption-items/ GET {#/redemption/redemption-items/-get-1}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | quantity\_available | int | No |  |
| **4** | start\_date | date | No |  |
| **5** | end\_date | date | No |  |
| **6** | prize\_type | str | No |  |
| **7** | credit\_amount | int | Yes | Required if prize\_type is Credit, else not required |
| **8** | tokens\_needed | int | No |  |
| **9** | promotion | str(Decimal) | No |  |
| **10** | image | Image | Yes |  |

#### 

#### /redemption/redemption-items/ POST {#/redemption/redemption-items/-post}

#### /redemption/redemption-items/{uuid}/ PUT {#/redemption/redemption-items/{uuid}/-put}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | quantity\_available | int | No |  |
| **3** | start\_date | date | No |  |
| **4** | end\_date | date | No |  |
| **5** | prize\_type | Int (Enum) | No | 1 \= ITEM 2 \= VOUCHER 3 \= CREDIT 4 \= OTHERS |
| **6** | credit\_amount | int | Yes | Required if prize\_type is 3, else not required |
| **7** | tokens\_needed | int | No |  |
| **8** | promotion | str(Decimal) | No |  |
| **9** | image | Image | Yes |  |

#### /redemption/redemption-items/{uuid}/archive/ PATCH {#/redemption/redemption-items/{uuid}/archive/-patch}

## Checkin \- Settings {#checkin---settings}

#### /settings/checkin-settings/ GET {#/settings/checkin-settings/-get}

Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | rewards | List |  |
| **1a** | day | Int |  |
| **1b** | reward\_minimum | int |  |
| **1c** | reward\_maximum | int |  |
| **1d** | display\_text | str |  |

#### /settings/checkin-settings/ POST {#/settings/checkin-settings/-post}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | day\_settings | obj | \- | A day\_settings object consists of a day, reward\_minimum, and reward\_maximum. Display\_text is optional |
| **1a** | day | int | False |  |
| **1b** | reward\_minimum | int | False |  |
| **1c** | reward\_maximum | int | False |  |
| **1d** | display\_text | str | True |  |

It will automatically delete days which are not inputted