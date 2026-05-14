# Table of Contents {#table-of-contents}

[**Table of Contents	1**](#table-of-contents)

[**Changelog	5**](#changelog)

[**Initial Setup of MRS	6**](#initial-setup-of-mrs)

[Base Domain	6](#base-domain)

[Developer Access	6](#developer-access)

[Paginated Results	6](#paginated-results)

[**ADMIN PAGE	7**](#admin-page)

[MRS VIP TIER \- GET	7](#mrs-vip-tier---get)

[MRS VIP TIER \- POST/PUT	7](#mrs-vip-tier---post/put)

[MRS VIP TIER \- ARCHIVE	8](#mrs-vip-tier---archive)

[**USER PAGE	9**](#user-page)

[MEMBER LOGIN FROM EXTERNAL	9](#member-login-from-external)

[/login/generate-token/ POST	9](#/login/generate-token/-post)

[HOME PAGE	10](#home-page)

[Front View \- Winning List	10](#front-view---winning-list)

[/front-view/winning-list/ GET	10](#/front-view/winning-list/-get)

[Front View \- Total Users	10](#front-view---total-users)

[/front-view/total-users/ GET	10](#/front-view/total-users/-get)

[Front View \- Active Users	10](#front-view---active-users)

[/front-view/active-users/ GET	10](#/front-view/active-users/-get)

[Front View \- Active Users	10](#front-view---active-users-1)

[/front-view/daily-check-in/ GET	10](#/front-view/daily-check-in/-get)

[Checkin	11](#checkin)

[/member/members/check-in/ POST	11](#/member/members/check-in/-post)

[Welcome Gift	12](#welcome-gift)

[/member/members/welcome/ POST	12](#/member/members/welcome/-post)

[Member Info	12](#member-info)

[/member/members/{member\_uuid}/ GET	12](#/member/members/{member_uuid}/-get)

[LUCKY SPIN	13](#lucky-spin)

[Spins	13](#spins)

[/member/\<member\_uuid\>/one-spin/ POST	13](#/member/\<member_uuid\>/one-spin/-post)

[/member/\<member\_uuid\>/ten-spin/ POST	13](#/member/\<member_uuid\>/ten-spin/-post)

[/member/\<member\_uuid\>/fifty-spin/ POST	13](#/member/\<member_uuid\>/fifty-spin/-post)

[/member/\<member\_uuid\>/hundred-spin/ POST	13](#/member/\<member_uuid\>/hundred-spin/-post)

[**PROFILE PAGE	14**](#profile-page)

[Personal data page	14](#personal-data-page)

[/member/profile/\<member\_uuid\>/ GET	14](#/member/profile/\<member_uuid\>/-get)

[/member/profile/\<member\_uuid\>/update-profile/ PATCH	14](#/member/profile/\<member_uuid\>/update-profile/-patch)

[Member Token History	15](#member-token-history)

[\`/member/\<member\_uuid\>/member-tokens/ GET	15](#\`/member/\<member_uuid\>/member-tokens/-get)

[Admin Reward Report	16](#admin-reward-report)

[\`/member/\<member\_uuid\>/member-rewards/ GET	16](#\`/member/\<member_uuid\>/member-rewards/-get)

[**LUCKY MART \- REDEMPTION	18**](#lucky-mart---redemption)

[Redemption items / redeem	18](#redemption-items-/-redeem)

[/redemption/redemption-items/available-items/ GET	18](#/redemption/redemption-items/available-items/-get)

[/redemption/redemption-items/{uuid}/redeem/ POST	18](#/redemption/redemption-items/{uuid}/redeem/-post)

[**User Page \- Banners	19**](#user-page---banners)

[Public Banners	19](#public-banners)

[/settings/banners/public/ GET	19](#/settings/banners/public/-get)

[**BACK OFFICE	20**](#back-office)

[**Logins	20**](#logins)

[Login \- Admin Access Token	20](#login---admin-access-token)

[/login/admin-access-token/ POST	20](#/login/admin-access-token/-post)

[Login \- Logout	20](#login---logout)

[/login/logout/ POST	20](#/login/logout/-post)

[Login \- Refresh Token	20](#login---refresh-token)

[/login/refresh-token/ POST	20](#/login/refresh-token/-post)

[Login \- Verify Token	20](#login---verify-token)

[/login/verify-token/ POST	20](#/login/verify-token/-post)

[Lucky Spin Management	22](#lucky-spin-management)

[Lucky Spin Items	22](#lucky-spin-items)

[/lucky-spin/lucky-spin-items/ \- GET	22](#/lucky-spin/lucky-spin-items/---get)

[/lucky-spin/lucky-spin-items/{uuid}/ \- GET	22](#/lucky-spin/lucky-spin-items/{uuid}/---get)

[Lucky Spin Items \- POST and PUT	22](#lucky-spin-items---post-and-put)

[/lucky-spin/lucky-spin-items/ \- POST	22](#/lucky-spin/lucky-spin-items/---post)

[/lucky-spin/lucky-spin-items/{uuid}/ \- PUT	22](#/lucky-spin/lucky-spin-items/{uuid}/---put)

[/lucky-spin/lucky-spin-items/{uuid}/archive/ \- PATCH	23](#/lucky-spin/lucky-spin-items/{uuid}/archive/---patch)

[**Lucky Spin Sequence	24**](#lucky-spin-sequence)

[Lucky Spin Sequence \- GET	24](#lucky-spin-sequence---get)

[/lucky-spin/lucky-spin-sequences/ \- GET	24](#/lucky-spin/lucky-spin-sequences/---get)

[/lucky-spin/lucky-spin-sequences/{uuid}/ \- GET	24](#/lucky-spin/lucky-spin-sequences/{uuid}/---get)

[Lucky Spin Sequences \- POST	24](#lucky-spin-sequences---post)

[/lucky-spin/lucky-spin-sequences/ \- POST	24](#/lucky-spin/lucky-spin-sequences/---post)

[Lucky Spin Sequences \- DELETE	25](#lucky-spin-sequences---delete)

[/lucky-spin/lucky-spin-sequences/{uuid}/ \- DELETE	25](#/lucky-spin/lucky-spin-sequences/{uuid}/---delete)

[Lucky Spin Sequences ORDER \- PATCH	25](#lucky-spin-sequences-order---patch)

[/lucky-spin/lucky-spin-sequences/change-spin-sequences/ \- PATCH	25](#/lucky-spin/lucky-spin-sequences/change-spin-sequences/---patch)

[Member Page	26](#member-page)

[**Members	26**](#members)

[/member/members/ GET	26](#/member/members/-get)

[Member List \- Full List	26](#member-list---full-list)

[/member/member-list/ GET	26](#/member/member-list/-get)

[Member List \- Single Member	28](#member-list---single-member)

[/member/member-list/{member\_uuid}/ GET	28](#/member/member-list/{member_uuid}/-get)

[Member List \- Single Member \- Edit	29](#member-list---single-member---edit)

[/member/member-list/{member\_uuid}/ PUT	29](#/member/member-list/{member_uuid}/-put)

[Member Deposit History	30](#member-deposit-history)

[/member/\<member\_uuid\>/member-deposit/ GET	30](#/member/\<member_uuid\>/member-deposit/-get)

[Report Page	31](#report-page)

[Admin Token Report \- GET	31](#admin-token-report---get)

[Admin Reward Report \- GET	32](#admin-reward-report---get)

[Member Report \- Daily / Monthly / Yearly \- GET	33](#member-report---daily-/-monthly-/-yearly---get)

[MART TIER	35](#mart-tier)

[MART TIER \- GET	35](#mart-tier---get)

[MART TIER \- POST/PUT	35](#mart-tier---post/put)

[MART TIER \- ARCHIVED	35](#mart-tier---archived)

[MART ITEMS	36](#mart-items)

[MART ITEMS \- GET	36](#mart-items---get)

[MART ITEMS \- POST/PUT	36](#mart-items---post/put)

[MART ITEMS \- ARCHIVE	37](#mart-items---archive)

[Checkin \- Settings \- GET	38](#checkin---settings---get)

[Checkin \- Settings \- POST	38](#checkin---settings---post)

[Terms and Conditions \- Settings	39](#terms-and-conditions---settings)

[T\&C \- GET	39](#t&c---get)

[T\&C \- POST	39](#t&c---post)

[T\&C \- PUBLIC \- GET	39](#t&c---public---get)

[Banners \- Settings	41](#banners---settings)

[Banners in Admin Panel	41](#banners-in-admin-panel)

[/settings/banners/ GET	41](#/settings/banners/-get)

[/settings/banners/ POST	41](#/settings/banners/-post)

[/settings/banners/{uuid}/ PUT	41](#/settings/banners/{uuid}/-put)

[/settings/banners/{uuid}/archive/ PATCH	42](#/settings/banners/{uuid}/archive/-patch)

[Wallet \- Wallet VIP	43](#wallet---wallet-vip)

[Wallet VIP \- GET	43](#wallet-vip---get)

[Wallet VIP \- POST	44](#wallet-vip---post)

[Wallet VIP \- ARCHIVE	44](#wallet-vip---archive)

[Wallet Floating Menus \- GET	45](#wallet-floating-menus---get)

[Wallet Floating Menu \- POST/PUT	46](#wallet-floating-menu---post/put)

[Wallet Floating Menu \- ARCHIVE	46](#wallet-floating-menu---archive)

[Member Feedback \- GET/POST	47](#member-feedback---get/post)

[Frames	48](#frames)

[Frames \- GET	48](#frames---get)

[Frames \- POST/PUT	48](#frames---post/put)

[Frames \- Archive	49](#frames---archive)

[**EXTERNAL	50**](#external)

[Special Code \- GET	50](#special-code---get)

[Wallet VIP Tiers \- GET	50](#wallet-vip-tiers---get)

[Wallet Floating Menus \- GET	50](#wallet-floating-menus---get-1)

# Changelog {#changelog}

| Date | Changes Made | Modules |
| :---- | :---- | :---- |
| 2026/05/07 | Added Floating Menu and Wallet VIP Tier |  |
| 2026/05/06 | Added reports and member list |  |
| 2026/04/02 | Added location to banner | User Page \- Banners Back Office \- Banners |
| 2026/03/31 | Added profile picture to member profileAdded banners | Modules: Profile Page User Page \- Banners Back Office \- Banners |
| 2026/03/30 | Added winning list | Modules:User Page \- Front View \- Winning List |
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

## Paginated Results {#paginated-results}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | count | Int | Shows number of items |
| **2** | next | Str (URL) | Shows url to input for next page |
| **3** | previous | Str (URL) | Shows url to input for previous page |
| **4** | results | List of Objects |  |

# ADMIN PAGE {#admin-page}

## MRS VIP TIER \- GET {#mrs-vip-tier---get}

/member/vip-tier/ GET  
Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | id | Int |  |
| **2** | uuid | UUID |  |
| **3** | name | Str |  |
| **4** | lifetime\_deposit\_required | Str(Decimal) |  |
| **5** | monthly\_deposit | Str(Decimal) |  |
| **6** | upgrade\_bonus | int |  |
| **7** | birthday\_bonus | int |  |
| **8** | check\_in\_token | int |  |
| **9** | mart\_tier | str |  |

## MRS VIP TIER \- POST/PUT {#mrs-vip-tier---post/put}

/member/vip-tier/ POST  
/member/vip-tier/{tier\_uuid}/ PUT  
Input

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | name | Str |  |
| **2** | lifetime\_deposit\_required | Str(Decimal) |  |
| **3** | monthly\_deposit | Str(Decimal) |  |
| **4** | upgrade\_bonus | Int |  |
| **5** | birthday\_bonus | Int |  |
| **6** | check\_in\_token | Int |  |
| **7** | mart\_tier\_uuid | UUID | Check/redemption/redemption-tier/ |

## MRS VIP TIER \- ARCHIVE {#mrs-vip-tier---archive}

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

### Front View \- Winning List {#front-view---winning-list}

#### /front-view/winning-list/ GET {#/front-view/winning-list/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | datetime\_obtained | datetime | No |  |
| **3** | display\_name | Str | No | If phone number, will be masked automatically |
| **4** | prize\_name | Str | No |  |

Returns 200 maximum

### Front View \- Total Users {#front-view---total-users}

#### /front-view/total-users/ GET {#/front-view/total-users/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_users | Int | No |  |

### Front View \- Active Users {#front-view---active-users}

#### /front-view/active-users/ GET {#/front-view/active-users/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | active\_users | Int | No |  |

### Front View \- Active Users {#front-view---active-users-1}

#### /front-view/daily-check-in/ GET {#/front-view/daily-check-in/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | 7D | Int | No |  |
| **2** | 6D | Int | No |  |
| **3** | 5D | Int | No |  |
| **4** | 4D | Int | No |  |
| **5** | 3D | Int | No |  |
| **6** | 2D | Int | No |  |
| **7** | 1D | Int | No |  |
| **8** | 0D | Int | No |  |

### 

### Checkin {#checkin}

#### /member/members/check-in/ POST {#/member/members/check-in/-post}

Returns

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | tokens\_obtained | Int | No |  |

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
| **9** | profile\_picture | Image | Yes |  |

#### /member/profile/\<member\_uuid\>/update-profile/ PATCH {#/member/profile/<member_uuid>/update-profile/-patch}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | full\_name | str | Yes |  |
| **2** | email | str(email) | Yes |  |
| **3** | date\_of\_birth | date | Yes |  |
| **4** | gender | Int (Enum) | Yes | 1 \- Male 2 \- Female 3 \- Prefer not to say |
| **5** | hobby | Int (Enum) | Yes | 1 \- Reading 2 \- Cooking / Baking 3 \- Travelling 4 \- Music 5 \- Gaming 6 \- Sports 7 \- Gardening 8 \- Photography 9 \- Art 10 \- Crafting 11 \- Watching Videos 12 \- Dancing 13 \- Hiking 14 \- Writing 15 \- Animal Care |
| **6** | profile\_picture | Image | Yes |  |

### Member Token History {#member-token-history}

#### \`/member/\<member\_uuid\>/member-tokens/ GET {#`/member/<member_uuid>/member-tokens/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | start\_date | date | Yes |  |
| **4** | end\_date | date | Yes |  |
| **5** | category | int | Yes | 1 \= Check-In 2 \= LuckySpin 3 \= VIP-Monthly 4 \= Mart-Redeem 5 \= Top Up 6 \= Welcome 7 \= VIP-Upgrade 8 \= VIP-Birthday 9 \= Finish-Profile |
| **6** | token\_details | str | Yes | Fuzzy search |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | Yes |  |
| **4** | category | str | No |  |
| **5** | token\_details | str | Yes |  |
| **6** | amount | str(Decimal) | Yes |  |

### Admin Reward Report {#admin-reward-report}

#### \`/member/\<member\_uuid\>/member-rewards/ GET {#`/member/<member_uuid>/member-rewards/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | start\_date | date | Yes |  |
| **4** | end\_date | date | Yes |  |
| **5** | category | int | Yes | 1 \= Prize 2 \= Credit |
| **6** | reward\_details | str | Yes | Fuzzy search |
| **7** | reward\_name | str | Yes | Fuzzy search |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | Yes |  |
| **4** | category | str | No |  |
| **5** | reward\_details | str | No |  |
| **6** | reward\_name | str | No |  |

# LUCKY MART \- REDEMPTION {#lucky-mart---redemption}

### Redemption items / redeem {#redemption-items-/-redeem}

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

# User Page \- Banners {#user-page---banners}

### Public Banners {#public-banners}

### /settings/banners/public/ GET {#/settings/banners/public/-get}

Query parameter

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | location | Int | Yes | 1 \- Main Page 2 \- Side Panel |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | image | Image | No |  |
| **4** | slug | Str (url) | No | Where the banner will link to |
| **5** | active\_until | datetime | No |  |
| **6** | location | Str | No |  |

### 

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
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |

Output (Is Paginated, has results, previous, next, and count)

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

## Member Page {#member-page}

### Members {#members}

#### /member/members/ GET {#/member/members/-get}

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

### Member List \- Full List {#member-list---full-list}

#### /member/member-list/ GET {#/member/member-list/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | member\_name | str | Yes |  |
| **4** | phone\_number | str | Yes |  |
| **5** | vip\_tier\_uuid | uuid | Yes | /member/vip-tier/ GET |
| **6** | station\_uuid | uuid | Yes | /front-view/station-list/ GET |
| **7** | registered\_start\_date | date | Yes |  |
| **8** | registered\_end\_date | date | Yes |  |
| **9** | last\_checkin\_start\_date | date | Yes |  |
| **10** | last\_checkin\_end\_date | date | Yes |  |
| **11** | last\_login\_start\_date | date | Yes |  |
| **12** | last\_login\_end\_date | date | Yes |  |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | full\_name | str | Yes |  |
| **4** | phone\_number | str | No |  |
| **5** | vip\_tier | str | No |  |
| **6** | current\_tokens | int | No |  |
| **7** | registered\_datetime | datetime | No |  |
| **8** | last\_check\_in\_date | date | Yes |  |
| **9** | last\_login\_datetime | datetime | No |  |

### Member List \- Single Member {#member-list---single-member}

#### /member/member-list/{member\_uuid}/ GET {#/member/member-list/{member_uuid}/-get}

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | full\_name | str | Yes |  |
| **4** | phone\_number | str | No |  |
| **5** | vip\_tier | str | No |  |
| **6** | current\_tokens | int | No |  |
| **7** | registered\_datetime | datetime | No |  |
| **8** | last\_check\_in\_date | date | Yes |  |
| **9** | last\_login\_datetime | datetime | No |  |
| **10** | email | str | Yes |  |
| **11** | date\_of\_birth | date | Yes |  |
| **12** | gender | str | Yes |  |
| **13** | hobby | str | Yes |  |
| **14** | profile\_picture | str | Yes |  |
| **15** | stations | List | \- | See Stations below |

Stations

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | station\_name | str | No |  |
| **4** | station\_id | str | No |  |
| **5** | deposit\_amount | str (Decimal) | No |  |
| **6** | wallet\_site\_vip | str | No |  |

### Member List \- Single Member \- Edit {#member-list---single-member---edit}

#### /member/member-list/{member\_uuid}/ PUT {#/member/member-list/{member_uuid}/-put}

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | full\_name | str | Yes |  |
| **2** | email | Str (Email) | Yes |  |
| **3** | date\_of\_birth | Date | Yes |  |
| **4** | gender | Int | Yes | 1 \= Male 2 \= Female 3 \= Prefer not to say |
| **5** | hobby | Int | Yes | 1 \- Reading 2 \- Cooking / Baking 3 \- Travelling 4 \- Music 5 \- Gaming 6 \- Sports 7 \- Gardening 8 \- Photography 9 \- Art 10 \- Crafting 11 \- Watching Videos 12 \- Dancing 13 \- Hiking 14 \- Writing 15 \- Animal Care |
| **6** | profile\_picture | Image | Yes |  |
| **7** | mrs\_vip\_tier\_uuid | UUID | No | /member/vip-tier/ GET |

### Member Deposit History {#member-deposit-history}

#### /member/\<member\_uuid\>/member-deposit/ GET {#/member/<member_uuid>/member-deposit/-get}

Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | start\_date | date | Yes |  |
| **4** | end\_date | date | Yes |  |
| **5** | station\_uuid | uuid | Yes | /front-view/station-list/ GET |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | Yes |  |
| **4** | station | str | Yes |  |
| **5** | amount | str (Decimal) | No |  |

### 

## 

## Report Page {#report-page}

### Admin Token Report \- GET {#admin-token-report---get}

/member/token-report/ GET  
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | Yes | For Pagination |
| **3** | start\_date | date | Yes |  |
| **4** | end\_date | date | Yes |  |
| **5** | category | int | Yes | 1 \= Check-In 2 \= LuckySpin 3 \= VIP-Monthly 4 \= Mart-Redeem 5 \= Top Up 6 \= Welcome 7 \= VIP-Upgrade 8 \= VIP-Birthday 9 \= Finish-Profile |
| **6** | token\_details | str | Yes | Fuzzy search |
| **7** | username | str | Yes | Fuzzy search |
| **8** | phone\_number | str | Yes | Fuzzy search |
| **9** | station\_uuid | uuid | Yes | /front-view/station-list/ GET |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | Yes |  |
| **4** | phone\_number | str | No |  |
| **5** | username | str | Yes |  |
| **6** | station | str | Yes |  |
| **7** | category | str | No |  |
| **8** | token\_details | str | Yes |  |
| **9** | amount | str(Decimal) | Yes |  |

### Admin Reward Report \- GET {#admin-reward-report---get}

/member/reward-report/ GET  
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | Yes | For Pagination |
| **2** | page\_size | Int | yes | For Pagination |
| **3** | start\_date | date | Yes |  |
| **4** | end\_date | date | Yes |  |
| **5** | category | int | Yes | 1 \= Prize 2 \= Credit |
| **6** | reward\_details | str | Yes | Fuzzy search |
| **7** | username | str | Yes | Fuzzy search |
| **8** | phone\_number | str | Yes | Fuzzy search |
| **9** | station\_uuid | uuid | Yes | /front-view/station-list/ GET |
| **10** | reward\_name | str | Yes | Fuzzy search |

Output (Is paginated, has count, next, previous, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | Int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | created | datetime | Yes |  |
| **4** | phone\_number | str | No |  |
| **5** | username | str | Yes |  |
| **6** | station | str | Yes |  |
| **7** | category | str | No |  |
| **8** | reward\_details | str | No |  |
| **9** | reward\_name | str | No |  |

### Member Report \- Daily / Monthly / Yearly \- GET {#member-report---daily-/-monthly-/-yearly---get}

/member/member-report/daily/ GET  
/member/member-report/monthly/ GET  
/member/member-report/yearly/ GET  
Query Parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | start\_date | Date | No |  |
| **2** | end\_date | Date | No |  |

Without query parameters, report will not load

Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | results | List | See Results below |
| **2** | total\_new\_members | Int |  |
| **3** | total\_active\_members | Int |  |
| **4** | total\_members | Int |  |
| **5** | total\_tokens\_issued | Int |  |

Results

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | date | Daily \- “YYYY-MM-DD”Monthly \- “YYYY-MM”Yearly \- “YYYY” | See Results below |
| **2** | new\_members | Int |  |
| **3** | active\_members | Int |  |
| **4** | total\_members | Int |  |
| **5** | total\_tokens\_issued | Int |  |

### 

### 

## MART TIER {#mart-tier}

### MART TIER \- GET {#mart-tier---get}

/redemption/redemption-tier/ GET  
/redemption/redemption-tier/{uuid}/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | level | int | No |  |

### MART TIER \- POST/PUT {#mart-tier---post/put}

/redemption/redemption-tier/ POST  
/redemption/redemption-tier/{uuid}/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | level | int | No |  |

### MART TIER \- ARCHIVED {#mart-tier---archived}

/redemption/redemption-tier/{uuid}/ PATCH

## 

## 

## MART ITEMS {#mart-items}

### MART ITEMS \- GET {#mart-items---get}

/redemption/redemption-items/ GET  
Query parameters

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | page | List | For Pagination |
| **2** | page\_size | str | For Pagination |

Output (Is paginated, has count, next, previous, and results)

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
| **9** | promotion | int  | No |  |
| **10** | image | Image | Yes |  |
| **11** | mart\_tier | str | Yes |  |

### MART ITEMS \- POST/PUT {#mart-items---post/put}

/redemption/redemption-items/ POST  
/redemption/redemption-items/{uuid}/ PUT

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | quantity\_available | int | No |  |
| **3** | start\_date | date | No |  |
| **4** | end\_date | date | No |  |
| **5** | prize\_type | Int (Enum) | No | 1 \= ITEM 2 \= VOUCHER 3 \= CREDIT 4 \= OTHERS |
| **6** | credit\_amount | int | Yes | Required if prize\_type is 3, else not required |
| **7** | tokens\_needed | int | No |  |
| **8** | promotion | int | No |  |
| **9** | image | Image | Yes |  |
| **10** | tier\_uuid | UUID | No | /redemption/redemption-tier/ GET |

### MART ITEMS \- ARCHIVE {#mart-items---archive}

/redemption/redemption-items/{uuid}/archive/ PATCH

## Checkin \- Settings \- GET {#checkin---settings---get}

/settings/checkin-settings/ GET  
Output

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | rewards | List |  |
| **1a** | day | Int |  |
| **1b** | reward\_minimum | int |  |
| **1c** | reward\_maximum | int |  |
| **1d** | display\_text | str |  |

## Checkin \- Settings \- POST {#checkin---settings---post}

/settings/checkin-settings/ POST

Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | day\_settings | obj | \- | A day\_settings object consists of a day, reward\_minimum, and reward\_maximum. Display\_text is optional |
| **1a** | day | int | False |  |
| **1b** | reward\_minimum | int | False |  |
| **1c** | reward\_maximum | int | False |  |
| **1d** | display\_text | str | True |  |

## Terms and Conditions \- Settings {#terms-and-conditions---settings}

### T\&C \- GET {#t&c---get}

/settings/terms-and-conditions/ GET

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms\_and\_conditions | Text | No |  |
| **2** | category | Str | No |  |
| **3** | category\_number | Int | No |  |
| **4** | updated | Datetime | No |  |

### T\&C \- POST {#t&c---post}

/settings/terms-and-conditions/ POST  
Returns 200

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms\_and\_conditions | Text | No |  |
| **2** | category | Int | No | 1 \= Lucky Spin 2 \= Deposit Leaderboard 3 \= Withdraw Leaderboard 4 \= Referrer Leaderboard 5 \= World Cup Leaderboard 6 \= Smash Egg 7 \= Penalty Kick 8 \= Main Page 9 \= Wallet VIP |

### T\&C \- PUBLIC \- GET {#t&c---public---get}

/settings/terms-and-conditions/public/\<category\>/ GET  
Category is int, doesn’t need authentication

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | terms\_and\_conditions | Text | No |  |

### 

## 

## Banners \- Settings {#banners---settings}

### Banners in Admin Panel {#banners-in-admin-panel}

### /settings/banners/ GET {#/settings/banners/-get}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | image | Image | No |  |
| **4** | slug | Str (url) | No | Where the banner will link to |
| **5** | active\_until | datetime | No |  |
| **6** | location | Str | No |  |

### /settings/banners/ POST {#/settings/banners/-post}

### /settings/banners/{uuid}/ PUT {#/settings/banners/{uuid}/-put}

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | image | Image | No |  |
| **3** | slug | Str (url) | No | Where the banner will link to |
| **4** | active\_until | datetime | No |  |
| **5** | location | Int (Enum) | No | 1 \- Main Page 2 \- Side Panel |

### /settings/banners/{uuid}/archive/ PATCH {#/settings/banners/{uuid}/archive/-patch}

## Wallet \- Wallet VIP {#wallet---wallet-vip}

### Wallet VIP \- GET {#wallet-vip---get}

/third-party/wallet-vip/ GET  
/third-party/wallet-vip/{uuid}/ GET  
Query Parameters

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | station\_name | str | Fuzzy |
| **2** | tier\_name | str | Fuzzy |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | name | str | No |  |
| **4** | lifetime\_deposit\_required | Str (Decimal) | No |  |
| **5** | monthly\_deposit | Str (Decimal) | No |  |
| **6** | upgrade\_bonus | Str (Decimal) | No |  |
| **7** | monthly\_loyalty\_bonus | Str (Decimal) | No |  |
| **8** | birthday\_bonus | Str (Decimal) | No |  |
| **9** | station\_name | str | No |  |
| **10** | icon | Image | Yes |  |

### 

### Wallet VIP \- POST {#wallet-vip---post}

/third-party/wallet-vip/ POST  
/third-party/wallet-vip/{uuid}/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | lifetime\_deposit\_required | Str (Decimal) | No |  |
| **3** | monthly\_deposit | Str (Decimal) | No |  |
| **4** | upgrade\_bonus | Str (Decimal) | No |  |
| **5** | monthly\_loyalty\_bonus | Str (Decimal) | No |  |
| **6** | birthday\_bonus | Str (Decimal) | No |  |
| **7** | station\_uuid | UUID | No | /front-view/station-list/ GET |
| **8** | icon | Image | Yes |  |

### Wallet VIP \- ARCHIVE {#wallet-vip---archive}

/third-party/wallet-vip/{uuid}/archive/ PATCH

## Wallet Floating Menus

### Wallet Floating Menus \- GET {#wallet-floating-menus---get}

/third-party/floating-menu/ GET  
/third-party/floating-menu/{uuid}/ GET  
Query Parameters

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | station\_name | str | Fuzzy |
| **2** | display\_text | str | Fuzzy |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | int | No |  |
| **2** | uuid | UUID | No |  |
| **3** | display\_text | str | No |  |
| **4** | url\_slug | Str (Url) | No |  |
| **5** | icon | Image | Yes |  |
| **6** | display\_order | Int | No |  |
| **7** | station\_name | str | No |  |

### 

### Wallet Floating Menu \- POST/PUT {#wallet-floating-menu---post/put}

/third-party/floating-menu/ POST  
/third-party/floating-menu/{uuid}/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | display\_text | str | No |  |
| **2** | url\_slug | url | No |  |
| **3** | icon | image | Yes |  |
| **4** | display\_order | int | No | Display order is unique in stations |
| **5** | station\_uuid | UUID | No | /front-view/station-list/ GET |

### 

### 

### 

### 

### 

### 

### Wallet Floating Menu \- ARCHIVE {#wallet-floating-menu---archive}

/third-party/floating-menu/{uuid}/archive/ PATCH

## Wallet Floating Menu Root Icon

### Wallet Floating Menu Root Icon \- GET

/third-party/floating-menu-root-icon/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | station\_name | str | No |  |
| **3** | icon | image | No |  |

### Wallet Floating Menu Root Icon \- POST

/third-party/floating-menu-root-icon/ POST  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station\_uuid | uuid | No |  |
| **2** | icon | image | No |  |

Returns 200, overwrites previous icon

## 

## Member Feedback \- GET/POST {#member-feedback---get/post}

/front-view/member-feedback/ GET  
Query Parameters

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | page | str | For Pagination |
| **2** | page\_size | str | For Pagination |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | created | datetime | No |  |
| **3** | phone\_number | str | No |  |
| **4** | feedback | Text | No |  |

/front-view/member-feedback/ POST  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | member\_uuid | uuid | No |  |
| **2** | feedback | text | No |  |

## Frames {#frames}

### Frames \- GET {#frames---get}

/third-party/frame/ GET

Query Parameters

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | page | str | For Pagination |
| **2** | page\_size | str | For Pagination |

Output (Is paginated, has count, previous, next, and results)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | name | str | No |  |
| **3** | icon | Img | Yes |  |
| **4** | details | Text | Yes |  |
| **5** | challenge | str | No |  |
| **6** | vip\_tier | str | Yes |  |

### Frames \- POST/PUT {#frames---post/put}

/third-party/frame/ POST  
/third-party/frame/{uuid}/ PUT

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | icon | img | Yes |  |
| **3** | details | Text | Yes |  |
| **4** | challenge | int | No | 1 \= VIP |
| **5** | vip\_tier\_uuid | UUID | Yes | Only if Challenge \= 1 |

### Frames \- Archive {#frames---archive}

/third-party/frame/{uuid}/archive/ Patch

# EXTERNAL {#external}

All apis here do not need to be logged on to call

## Special Code \- GET {#special-code---get}

/third-party/special-codes/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station\_name | str | No |  |
| **2** | special\_code | str | No |  |

## Wallet VIP Tiers \- GET {#wallet-vip-tiers---get}

/third-party/station-wallet-vip/\<special\_code\>/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | lifetime\_deposit\_required | str | No |  |
| **3** | monthly\_deposit | Str (Decimal) | No |  |
| **4** | upgrade\_bonus | Str (Decimal) | No |  |
| **5** | monthly\_loyalty\_bonus | Str (Decimal) | No |  |
| **6** | birthday\_bonus | Str (Decimal) | No |  |

## Wallet Floating Menus \- GET {#wallet-floating-menus---get-1}

/third-party/station-floating-menu/\<special\_code\>/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | root\_icon | Image | Yes |  |
| **2** | data | List | \- | See data output below |

Data output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | display\_text | str | No |  |
| **2** | url\_slug | Str (Url) | No |  |
| **3** | icon | Image | Yes |  |
| **4** | display\_order | Int | No |  |

### 