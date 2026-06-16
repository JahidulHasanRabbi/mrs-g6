# Table of Contents {#table-of-contents}

[**Table of Contents	1**](#table-of-contents)

[**Initial Notes	3**](#initial-notes)

[Base Domain	3](#base-domain)

[Developer Access	3](#developer-access)

[Link to main document:	3](#link-to-main-document:)

[Paginated Results	3](#paginated-results)

[**User Access Panel	4**](#user-access-panel)

[New Login Method \- With Login Approval	4](#new-login-method---with-login-approval)

[Admin Login	4](#admin-login)

[Login Complete	5](#login-complete)

[User List	6](#user-list)

[User List \- GET	6](#user-list---get)

[User List \- POST	6](#user-list---post)

[User List \- POST	7](#user-list---post-1)

[Login Requests	7](#login-requests)

[Login Requests \- GET	7](#login-requests---get)

[Login Requests \- PATCH	8](#login-requests---patch)

[Activity Log	8](#activity-log)

[Activity Log \- GET	8](#activity-log---get)

[Permissions	9](#permissions)

[Permissions \- GET	9](#permissions---get)

[Roles	10](#roles)

[Roles \- GET	10](#roles---get)

[Roles \- POST / PUT	11](#roles---post-/-put)

[Roles \- Archive	11](#roles---archive)

[**Member Profile	12**](#member-profile)

[Member List	12](#member-list)

[Member List \- GET	12](#member-list---get)

[Member Single \- GET	13](#member-single---get)

[Member Single \- PUT / PATCH	15](#member-single---put-/-patch)

[**Retention Alert System	18**](#retention-alert-system)

[Priority Summary \- GET	18](#priority-summary---get)

[Refresh Members \- POST	18](#refresh-member---post)

[**Individual Sales Report	19**](#individual-sales-report)

[**Dashboard View	20**](#dashboard-view)

[Dashboard Summary	20](#dashboard-summary)

[Dashboard Summary \- GET	20](#dashboard-summary---get)

[Dashboard Details \- GET	20](#dashboard-details---get)

[**Retention Profile	22**](#retention-profile)

[Retention Summary	22](#retention-summary)

[Retention Member List \- GET	23](#retention-member-list---get)

[**Settings	25**](#settings)

[Member Assignment	25](#member-assignment)

[Member Assignment \- GET	25](#member-assignment---get)

[Member Assignment \- POST/PUT	25](#member-assignment---put)

[Member Assignment \- Set Deposit \- Patch	26](#heading=h.fvc8xk9awof9)

# Initial Notes {#initial-notes}

### Base Domain {#base-domain}

Staging: staging-api.kinggroup44.com

### Developer Access {#developer-access}

Username: Admin1  
Password: Qwerabcd\!

### Link to main document:  {#link-to-main-document:}

[MRS - G6 API Documentation](https://docs.google.com/document/d/1mDsVbZcMc6MiJZHJ0pDL6HCDeFHXs6C1p05MzRjZIOE/edit?tab=t.0#heading=h.uxz6o8o5yo2a)

### Paginated Results {#paginated-results}

| \# | Property/Field | Data Type | Description |
| ----: | :---- | :---- | :---- |
| **1** | count | Int | Shows number of items |
| **2** | next | Str (URL) | Shows url to input for next page |
| **3** | previous | Str (URL) | Shows url to input for previous page |
| **4** | results | List of Objects |  |

# User Access Panel {#user-access-panel}

## New Login Method \- With Login Approval {#new-login-method---with-login-approval}

### Admin Login {#admin-login}

/login/admin-login POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | username | str | No |  |
| **2** | password | str | No |  |
| **3** | ip\_address | str | Yes |  |
| **4** | device | str | Yes |  |

Response  
If user has bypass\_approval:

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | uuid | No |  |
| **2** | username | str | No |  |
| **3** | access | str | No |  |
| **4** | refresh | str | No |  |
| **5** | permissions | List | No | Returns list of permissions like “view\_admins”, “bypass\_approvals”, etc |
| **6** | role | str | No | Returns role name |

If user doesn’t have bypass\_approval:

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | message | str | No | Returns “approval\_required” |
| **2** | approval\_id | uuid | No |  |
| **3** | user\_id | UUID | No |  |

### Login Complete {#login-complete}

/login/admin-login/complete/ POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | approval\_id | UUID | No |  |

If Approval is approved:

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | id | uuid | No |  |
| **2** | username | str | No |  |
| **3** | access | str | No |  |
| **4** | refresh | str | No |  |
| **5** | permissions | List | No | Returns list of permissions like “view\_admins”, “bypass\_approvals”, etc |
| **6** | role | str | No | Returns role name |

Else:  
Error 400 \- Login Request has not been approved

## 

## User List {#user-list}

### User List \- GET {#user-list---get}

/admins/users/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | username | Str | No |  |
| **3** | full\_name | Str | No |  |
| **4** | role | Str | No |  |
| **5** | status | Str | No | Active or Inactive |

### User List \- POST {#user-list---post}

/admins/users/ POST  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | username | str | No |  |
| **2** | full\_name | str | No |  |
| **3** | role\_uuid | uuid | No |  |
| **4** | status | int | No | 1 \= Active2 \= Inactive |
| **5** | password | str | No |  |
| **6** | confirm\_password | str | No |  |

### User List \- POST {#user-list---post-1}

/admins/users/\<uuid\>/ PUT  
/admins/users/\<uuid\>/ PATCH  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | full\_name | str | No |  |
| **2** | role\_uuid | uuid | No |  |
| **3** | status | int | No | 1 \= Active2 \= Inactive |
| **4** | password | str | No |  |
| **5** | confirm\_password | str | No |  |

## Login Requests {#login-requests}

### Login Requests \- GET {#login-requests---get}

/admins/login-requests/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | status | int | Yes | 1 \= PENDING 2 \= APPROVED 3 \= REJECTED |
| **4** | username | str | Yes | icontains |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | ip\_address | Str | No |  |
| **3** | device | Str | No |  |
| **4** | request\_time | datetime | No |  |
| **5** | status | Str | No | Pending, Approved, Rejected |
| **6** | approved\_by | Str | Yes |  |
| **7** | approved\_datetime | datetime | Yes |  |

### Login Requests \- PATCH {#login-requests---patch}

/admins/login-requests/\<uuid\>/approve/ PATCH  
/admins/login-requests/\<uuid\>/reject/ PATCH  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | message | str | No | “Approved”“Rejected” |

## Activity Log {#activity-log}

### Activity Log \- GET {#activity-log---get}

/admins/activity-log/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | username | str | Yes | Fuzzy |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | datetime | datetime | No |  |
| **3** | user | Str | No |  |
| **4** | activity | Str | No |  |

## Permissions {#permissions}

### Permissions \- GET {#permissions---get}

/admins/permissions/ GET  
Response example:  
{  
"Others": {  
"Login": \[  
{  
"key": "view\_logins",  
"label": "View Logins"  
}  
\]  
},  
"Retention": {  
"Admins": \[  
{  
"key": "view\_admins",  
"label": "View Admins"  
}  
\],  
"Roles": \[  
{  
"key": "view\_roles",  
"label": "View Roles"  
}  
\]  
},  
"Member": {  
"VIP": \[  
{  
"key": "view\_vip",  
"label": "View VIP"  
}  
\]  
}  
}

Current Structure:

| \# | Property/Field | Description |
| ----: | :---- | :---- |
| **1** | Others | Logins |
| **2** | Retention | Admins Roles |
| **3** | Member | Tiers Spins |

## 

## Roles {#roles}

### Roles \- GET {#roles---get}

/admins/roles/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | name | str | No |  |
| **3** | permissions | List | No | List of strings |
| **4** | status | str | No |  |
| **5** | total\_assigned | int | No |  |

### Roles \- POST / PUT {#roles---post-/-put}

/admins/roles/ POST  
/admins/roles/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | permissions | List | No | List of keys from /permissions/ |
| **3** | status | Int | Yes (defaults to Active) | 1 \= Active 2 \= Inactive |

### Roles \- Archive {#roles---archive}

/admins/roles/\<uuid\>/archive/ PATCH

### 

# Member Profile {#member-profile}

## Member List {#member-list}

### Member List \- GET {#member-list---get}

/crm-members/members/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | priority | str | Yes | “inactive”, “low”, “medium”, “high” |
| **4** | wallet\_vip\_level | str | Yes | Fuzzy |
| **5** | mrs\_vip\_level | str | Yes | Fuzzy |
| **6** | retention | int | Yes |  |
| **7** | search | str | Yes | For Name and Phone Number, fuzzy |
| **8** | sales | str | Yes | “High” “Low” |
| **9** | win\_lose | str | Yes | “High” “Low” |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | full\_name | Str | No |  |
| **3** | username | Str | No |  |
| **4** | phone\_number | Str | No |  |
| **5** | vip\_level | Str | No |  |
| **6** | daily\_sales | Str(Decimal) | No |  |
| **7** | daily\_win\_loss | Str(Decimal) | No |  |
| **8** | priority | Str | No |  |
| **9** | retention | Str | No |  |
| **10** | alert | Bool | No |  |
| **11** | last\_followed\_up\_by | str | No |  |
| **12** | last\_followed\_up\_date | date | No |  |
| **13** | follow\_up\_status | str | No | “COMPLETED” “PENDING” “MISSED” “NONE” |

### Member Single \- GET {#member-single---get}

/crm-members/members/\<member\_uuid\>/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | full\_name | Str | No |  |
| **3** | customer\_data | Obj | \- | See Customer Data Output below |
| **4** | basic\_info | Obj | \- | See Basic Info Output below |
| **5** | financial\_info | Obj | \- | See Financial Info Output below |
| **6** | gaming\_info | Obj | \- | See Gaming Info Output below |
| **7** | alert | Bool | No |  |

Customer Data Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | mrs\_level | str | No |  |
| **2** | wallet\_level | List | No | Consists of: Station: str Level: str |
| **3** | total\_sales | str | No |  |
| **4** | total\_win\_lose | date | Yes |  |
| **5** | date\_joined | int | Yes |  |
| **6** | tags | List | Yes | Str |

Basic Data Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | username | str | No |  |
| **2** | phone\_number | str | No |  |
| **3** | gender | str | No |  |
| **4** | date\_of\_birth | date | Yes |  |
| **5** | age | int | Yes |  |
| **6** | nationality | str | Yes |  |
| **7** | home\_address | str | Yes |  |
| **8** | marital\_status | str | Yes |  |
| **9** | job | str | Yes |  |
| **10** | hobby | str | Yes |  |

Financial Data Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_sales | Str (Decimal) | No |  |
|  | total\_withdrawal | Str (Decimal) | No |  |
| **2** | total\_win\_lose | Str (Decimal) | No |  |
|  | total\_bonus | Str (Decimal) |  |  |
| **3** | total\_sales\_ticket | Int | No |  |
|  | total\_withdrawal\_ticket | Int |  |  |
| **4** | arpu | Str (Decimal) | No |  |
| **5** | average\_deposit | Str (Decimal) | No |  |
| **6** | last\_deposit\_date | date | No |  |
| **7** | payment\_method | str | Yes |  |

Gaming Data Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_preference | Str |  |  |
| **2** | provider\_preference | Str |  |  |
| **3** | play\_time\_pattern | Str |  |  |
| **4** | average\_bet\_size | Str |  |  |
| **5** | player\_type | Str |  |  |
| **6** | risk\_style | Str |  |  |
| **7** | deposit\_frequency\_style | Str |  |  |
| **8** | deposit\_trigger | Str |  |  |
| **9** | churn\_risk\_reason | Str |  |  |
| **10** | reactivation\_trigger | Str |  |  |
| **11** | note | Str |  |  |

### Member Single \- PUT / PATCH {#member-single---put-/-patch}

/crm-members/members/\<member\_uuid\>/ PUT  
/crm-members/members/\<member\_uuid\>/ PATCH  
Put requires All, patch can be flexible  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | profile\_data | Obj | \- | See Profile Data Input below |
| **2** | basic\_info | Obj | \- | See Basic Info Input below |
| **3** | game\_info | Obj | \- | See Game Info Input below |

Profile Data Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | mrs\_vip\_level\_uuid | UUID | No | Taken from mrs vip |
| **2** | tags | List\[str\] |  |  |
| **3** | wallet\_levels | List |  | station\_uuid: uuid wallet\_level\_uuid: uuid (taken from wallet level vip) |

Basic Info Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | gender | Int | No | (Will have choices later) |
| **2** | date\_of\_birth | Date | No |  |
| **3** | nationality | Int | No | (Will have choices later) |
| **4** | home\_address | Str | No |  |
| **5** | marital\_status | Int | No | (Will have choices later) |
| **6** | job | Str | No |  |
| **7** | hobby | Multiple Input | No | (Will have choices later) |
| **8** | payment\_method | Int | No | (Will have choices later) |

Game Info Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | game\_preference | Str | No |  |
| **2** | provider\_Preference | Multiple Input | No | (Will have choices later) |
| **3** | play\_type\_pattern | Int | No | (Will have choices later) |
| **4** | average\_bet\_size | Int | No | (Will have choices later) |
| **5** | player\_type | Int | No | (Will have choices later) |
| **6** | risk\_style | Int | No | (Will have choices later) |
| **7** | deposit\_frequency\_style | Int | No | (Will have choices later) |
| **8** | deposit\_trigger | Multiple Input | No | (Will have choices later) |
| **9** | churn\_risk\_reason | Multiple Input | No | (Will have choices later) |
| **10** | reactivation\_trigger | Multiple Input | No | (Will have choices later) |
| **11** | note | Text | Yes |  |

### Assign Member to PIC \- PATCH

/crm-members/members/\<member\_uuid\>/assign-to-pic/ PATCH

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | pic\_uuid | uuid | No |  |

### Member FollowUp \- PATCH

/crm-members/members/\<member\_uuid\>/follow-up/ PATCH

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | follow\_up\_remark | str | No |  |

### Member Alert \- PATCH

/crm-members/members/\<member\_uuid\>/alert/ PATCH

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | alert | bool | No |  |

### Member Bonus \- Post

/crm-members/members/\<member\_uuid\>/send-bonus/ POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | bonus | Str (Decimal) | No |  |
| **2** | station\_uuid | UUID | No |  |

Returns SUCCESS if bonus amount \< 10, ERROR if bonus amount \> 10, for staging purposes.

## Member List \- By Admin PIC

/crm-members/\<admin\_uuid\>/admin-members/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | priority | int | Yes |  |
| **4** | wallet\_vip\_level | str | Yes | Fuzzy |
| **5** | mrs\_vip\_level | str | Yes | Fuzzy |
| **6** | retention | int | Yes |  |
| **7** | search | str | Yes | For Name and Phone Number, fuzzy |
| **8** | sales | str | Yes | “High” “Low” |
| **9** | win\_lose | str | Yes | “High” “Low” |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | full\_name | Str | No |  |
| **3** | username | Str | No |  |
| **4** | phone\_number | Str | No |  |
| **5** | vip\_level | Str | No |  |
| **6** | daily\_sales | Str(Decimal) | No |  |
| **7** | daily\_win\_loss | Str(Decimal) | No |  |
| **8** | priority | Str | No |  |
| **9** | retention | Str | No |  |
| **10** | last\_followed\_up\_by | str |  |  |
| **11** | last\_followed\_up\_date | datetime |  |  |
| **12** | follow\_up\_status | str |  | “COMPLETED” “PENDING” “MISSED” “NONE” |

## Member FollowUp

/crm-members/follow-up/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | pic\_uuid | uuid | Yes |  |
| **4** | member\_uuid | uuid | Yes |  |
| **5** | start\_date end\_date | date date | Yes |  |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | datetime | datetime | No |  |
| **3** | pic | str | No |  |
| **4** | follow\_up\_remark | str | No |  |

# Retention Alert System {#retention-alert-system}

## Priority Summary \- GET {#priority-summary---get}

/crm-members/priority-summary/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | high\_priority | Int | No |  |
| **2** | medium\_priority | Int | No |  |
| **3** | low\_priority | Int | No |  |
| **4** | inactive\_members | Int | No |  |

## Refresh Member \- POST {#refresh-member---post}

/crm-members/\<member\_uuid\>/refresh/ POST  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | status | Str | No | “SUCCESS” or “ERROR” |
| **2** | error\_message | Str | Yes | Only if ERROR |

In staging:  
If member\_uuid \= “1234:  
Returns SUCCESS  
Else:  
Returns ERROR, error\_message \= “Staging Environment"

## Update Data \- POST

/crm-members/\<member\_uuid\>/update-data/ POST  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | status | Str | No | “SUCCESS” or “ERROR” |
| **2** | error\_message | Str | Yes | Only if ERROR |

In staging:  
If member\_uuid \= “1234:  
Returns SUCCESS  
Else:  
Returns ERROR, error\_message \= “Staging Environment"

# Notifications

## Notifications  \- GET

/crm-admins/notifications/ GET

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | created | datetime | No |  |
| **3** | number\_of\_members | Int | No |  |

## Notifications  \- Mark as Read

/crm-admins/notifications/\<notification\_uuid\>/mark-as-read/ PATCH  
A notification marked as read will no longer appear in GET

# Individual Sales Report {#individual-sales-report}

# Dashboard View {#dashboard-view}

## Dashboard Summary {#dashboard-summary}

### Dashboard Summary \- GET {#dashboard-summary---get}

/crm-admins/dashboard-summary/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | from\_date | Date | No |  |
| **2** | to\_date | Date | No |  |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_members | Int | No |  |
| **2** | active\_members | Int | No |  |
| **3** | total\_sales | Str(Decimal) | No |  |
| **4** | total\_win\_lose | Str(Decimal) | No |  |
| **5** | total\_sales\_tickets | Int | No |  |
| **6** | total\_bonus\_given | Str(Decimal) | No |  |
| **7** | total\_bonus\_given\_percentage | Str | No |  |
| **8** | total\_win\_rate | Str | No  |  |

### Dashboard Breakdown \- GET

/crm-admins/dashboard-breakdown/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | from\_date | Date | No |  |
| **2** | to\_date | Date | No |  |
| **3** | metric | Str | No | total\_members active\_members total\_sales total\_sales\_tickets total\_win\_lose total\_win\_rate total\_bonus\_given total\_bonus\_given\_percentage |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station | str | No |  |
| **2** | value | Mix of Int, Decimal, and str, but can treat all as str | No |  |

### Dashboard Details \- GET {#dashboard-details---get}

/crm-admins/dashboard-details/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | from\_date | Date | No |  |
| **4** | to\_date | Date | No |  |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | full\_name | Str | No |  |
| **3** | total\_members | Int | No |  |
| **4** | total\_sales | Str(Decimal) | No |  |
| **5** | total\_win\_lose | Str(Decimal) | No |  |
| **6** | monthly\_target | Str(Decimal) | No |  |
| **7** | achievements | Str(Decimal) | No |  |

# 

# Retention Profile {#retention-profile}

## Retention Summary {#retention-summary}

/crm-members/retention-summary/\<admin\_uuid\>/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | type | int | No | 1 \= Daily 2 \= Monthly 3 \= Yearly 4 \= Input Date |
| **2** | from\_date | Date | No if type is 4 |  |
| **3** | to\_date | Date | No if type is 4 |  |

Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_members | List | \- | See Members output below |
| **2** | total\_members\_\_total | Int | No |  |
| **3** | active\_members | List | \- | See Members output below |
| **4** | active\_members\_\_total | Int | No |  |
| **5** | total\_sales | List | \- | See Amount output below |
| **6** | total\_sales\_\_total | Str (Decimal) | No |  |
| **7** | total\_win\_lose | List | \- | See Amount output below |
| **8** | total\_win\_lose\_\_total | Str (Decimal) | No |  |
| **9** | total\_sales\_tickets | List | \- | See Amount below (Except it’s int instead of Str) |
| **10** | total\_sales\_tickets\_\_total | Int | No |  |

Members output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station | str |  |  |
| **2** | members | Int |  |  |

Amount output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station | str |  |  |
| **2** | amount | Str (Decimal) |  |  |

## Retention Member List \- GET {#retention-member-list---get}

/crm-members/retention-members/ GET  
Only returns member with priority  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | priority | str | Yes | “inactive” “low” “medium” “high” |
| **4** | mrs\_vip\_level | str | Yes | Fuzzy |
| **5** | wallet\_vip\_level | Str | Yes | Fuzzy |
| **6** | retention | uuid | Yes | PIC uuid |
| **7** | search | str | Yes | Fuzzy for phone and full name |
| **8** | sales | str | Yes | “High” “Low” |
| **9** | win\_lose | str | Yes | “High” “Low” |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | full\_name | str | No |  |
| **3** | username | str | No |  |
| **4** | brand | str | No |  |
| **5** | phone\_number | str | No |  |
| **6** | vip\_level | str | No |  |
| **7** | daily\_sales | str | No |  |
| **8** | daily\_win\_loss | str | No |  |
| **9** | priority | str | No |  |
| **10** | retention | str | No |  |

For single get, use Member Single \- GET  
For refresh, use Refresh Members \- POST

# Settings {#settings}

## Member Assignment {#member-assignment}

### Member Assignment \- GET {#member-assignment---get}

/crm-admins/assignments/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | profile\_picture | img | Yes |  |
| **3** | full\_name | str | No |  |
| **4** | no\_of\_members | int | No |  |
| **5** | retention\_target | Int | No |  |

/crm-admins/assignments/{admin\_uuid}/retention-target/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | month | int | No | Returns 1-12 |
| **2** | amount | Decimal | No | Returns 0 if not created |

### Member Assignment \- PUT {#member-assignment---put}

/crm-admins/assignments/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | retention\_targets | List | No | Check Retention Targets below |

Retention Targets

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | month | int | No | Accepts 1-12 |
| **2** | target | Str (Decimal) | No |  |

### Member Assignment \- Import Members

/crm-admins/assignments/\<uuid\>/import-members/ POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | member\_list | File | No | Accepts csv, xls, and xlsx |

## 

## Promotions

### Available Promotions

/settings/available-promotions/ GET

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | value | int | No |  |
| **2** | label | Str  | No |  |

### Promotions by Stations \- GET

/settings/promotions/get-by-station/\<station\_uuid\>/ GET

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | type | str | No |  |
| **2** | promotion | List | \- | See promotions GET below |

Promotions GET

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | item | Int or uuid | No | Returns int if not associated with an item, UUID otherwise |
| **2** | name | str | No | Returns name of item if associated with item, otherwise returns “Monthly VIP” “Upgrade VIP” “Birthday Bonus” “Manual Bonus” |
| **3** | code | int | No |  |

### Promotions by Stations \- POST

/settings/promotions/ POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | station\_id | uuid | No |  |
| **2** | promotions | List | \- | See promotions POST below |

Promotions POST

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | promotion\_type | Int | No | Use available-promotions |
| **2** | item\_uuid | UUID | Yes | Required if using an item |
| **3** | promotion-code | int | No |  |

### 