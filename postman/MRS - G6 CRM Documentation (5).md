# Table of Contents {#table-of-contents}

[**Table of Contents	1**](#table-of-contents)

[**Initial Notes	3**](#initial-notes)

[Base Domain	3](#base-domain)

[Developer Access	3](#developer-access)

[Link to main document:	3](#link-to-main-document:)

[Paginated Results	3](#paginated-results)

[**User Access Panel	4**](#user-access-panel)

[User List	4](#user-list)

[User List \- GET	4](#user-list---get)

[User List \- POST/PUT	4](#user-list---post/put)

[Login Requests	5](#login-requests)

[Login Requests \- GET	5](#login-requests---get)

[Login Requests \- PATCH	5](#login-requests---patch)

[Activity Log	6](#activity-log)

[Activity Log \- GET	6](#activity-log---get)

[Permissions	6](#permissions)

[Permissions \- GET	6](#permissions---get)

[Roles	7](#roles)

[Roles \- GET	7](#roles---get)

[Roles \- POST / PUT	7](#roles---post-/-put)

[Roles \- Archive	8](#roles---archive)

[**Member Profile	9**](#member-profile)

[Member List	9](#member-list)

[Member List \- GET	9](#member-list---get)

[Member Single \- GET	10](#member-single---get)

[Member Single \- PUT	12](#member-single---put)

[**Retention Alert System	14**](#retention-alert-system)

[Priority Summary \- GET	14](#priority-summary---get)

[Refresh Members \- POST	14](#refresh-members---post)

[**Individual Sales Report	15**](#individual-sales-report)

[**Dashboard View	16**](#dashboard-view)

[Dashboard Summary	16](#dashboard-summary)

[Dashboard Summary \- GET	16](#dashboard-summary---get)

[Dashboard Details \- GET	16](#dashboard-details---get)

[**Retention Profile	18**](#retention-profile)

[Retention Summary	18](#retention-summary)

[Retention Member List \- GET	19](#retention-member-list---get)

[**Settings	21**](#settings)

[Member Assignment	21](#member-assignment)

[Member Assignment \- GET	21](#member-assignment---get)

[Member Assignment \- POST/PUT	21](#member-assignment---post/put)

[Member Assignment \- Set Deposit \- Patch	22](#member-assignment---set-deposit---patch)

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

### User List \- POST/PUT {#user-list---post/put}

/admins/users/ POST  
/admins/users/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | username | str | No |  |
| **2** | full\_name | str | No |  |
| **3** | role\_uuid | uuid | No |  |
| **4** | status | int | No | 1 \= Active2 \= Inactive |
| **5** | password | str | No |  |
| **6** | confirm\_password | str | No |  |

## Login Requests {#login-requests}

### Login Requests \- GET {#login-requests---get}

/admins/login-requests/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | UUID | No |  |
| **2** | ip\_address | Str | No |  |
| **3** | device | Str | No |  |
| **4** | request\_time | datetime | No |  |
| **5** | status | Str | No | Pending, Approved, Rejected |

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
    "Members": \[  
        {  
            "key": "view\_members",  
            "label": "View Members"  
        },  
        {  
             "key": "edit\_members",  
             "label": "Edit Members"  
      }  
  \],  
 "Admins": \[  
   {  
     "key": "view\_admins",  
     "label": "View Admins"  
   }  
 \]  
}

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

### Roles \- POST / PUT {#roles---post-/-put}

/admins/roles/ POST  
/admins/roles/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | permissions | List | No | List of keys from /permissions/ |

### Roles \- Archive {#roles---archive}

/admins/roles/\<uuid\>/archive/ PATCH

### 

## VIP-Tier

### Vip Tiers \- GET

/crm-admins/vip-tier/ GET  
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

### Vip Tiers \- POST / PUT

/crm-admins/vip-tier/ POST  
/crm-admins/vip-tier/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |

### Vip Tiers \- Archive

### /crm-admins/vip-tier/\<uuid\>/archive/ PATCH

# Member Profile {#member-profile}

## Member List {#member-list}

### Member List \- GET {#member-list---get}

/crm-members/members/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | priority | int | Yes |  |
| **4** | vip\_level | int | Yes |  |
| **5** | retention | int | Yes |  |
| **6** | search | str | Yes | For Name and Phone Number, fuzzy |

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

Customer Data Output

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

### Member Single \- PUT {#member-single---put}

/crm-members/members/\<member\_uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | profile\_data | Obj | \- | See Profile Data Input below |
| **2** | basic\_info | Obj | \- | See Basic Info Input below |
| **3** | game\_info | Obj | \- | See Game Info Input below |

Profile Data Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | vip\_level\_uuid | UUID | No |  |
| **2** | player\_type | Int | No | (Will have choices later) |
| **3** | risk | Int | No | (Will have choices later) |
| **4** | deposit\_frequency | Int | No | (Will have choices later) |
| **5** | status | Int | No | (Will have choices later) |

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

## Refresh Members \- POST {#refresh-members---post}

/crm-members/refresh-members/ POST  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | message | Str | No | Currently returns “Refresh Successful” |

# Individual Sales Report {#individual-sales-report}

# Dashboard View {#dashboard-view}

## Dashboard Summary {#dashboard-summary}

### Dashboard Summary \- GET {#dashboard-summary---get}

/crm-admins/dashboard-summary/ GET  
Output

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | total\_members | Int | No |  |
| **2** | active\_members | Int | No |  |
| **3** | total\_sales | Str(Decimal) | No |  |
| **4** | daily\_win\_lose | Str(Decimal) | No |  |

### Dashboard Details \- GET {#dashboard-details---get}

/crm-admins/dashboard-details/ GET  
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | type | int | No | 1 \= Daily 2 \= Monthly 3 \= Yearly 4 \= Input Date |
| **4** | from\_date | Date | No if type is 4 |  |
| **5** | to\_date | Date | No if type is 4 |  |

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

## 

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
Query parameters

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | page | Int | No | For Pagination |
| **2** | page\_size | Int | No | For Pagination |
| **3** | from\_date | Date | Yes |  |
| **4** | to\_date | Date | Yes |  |
| **5** | vip\_level | int | Yes |  |
| **6** | from\_sales | int | Yes |  |
| **7** | to\_sales | Int | Yes |  |
| **8** | search | str | Yes | For Name and Phone Number, fuzzy |

Output (Is Paginated)

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | uuid | uuid | No |  |
| **2** | username | str | No |  |
| **3** | phone\_number | str | No |  |
| **4** | level | str | No |  |
| **5** | total\_sales | Str (Decimal) | No |  |
| **6** | total\_winlose | Str (Decimal) | No |  |
| **7** | last\_deposit | Date | No |  |

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
| **2** | full\_name | str | No |  |
| **3** | level | str | No |  |
| **4** | target\_members | int | No |  |
| **5** | retain\_criteria | Str (decimal) | No |  |
| **6** | upgrade\_criteria | Str (decimal) | No |  |
| **7** | retention\_target | Int | No |  |
| **8** | status | str |  |  |

### Member Assignment \- POST/PUT {#member-assignment---post/put}

/crm-admins/assignments/ POST  
/crm-admins/assignments/\<uuid\>/ PUT  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | name | str | No |  |
| **2** | status | int | No | 1 \= Active 2 \= Inactive |
| **3** | retain\_criteria | Str (Decimal) | No |  |
| **4** | upgrade\_criteria | Str (Decimal) | No |  |
| **5** | pic\_uuid | uuid | No | /admins/users/ GET |

### Member Assignment \- Set Deposit \- Patch {#member-assignment---set-deposit---patch}

/crm-admins/assignments/set-target/ PATCH  
Input

| \# | Property/Field | Data Type | Nullable | Description |
| ----: | :---- | :---- | :---- | :---- |
| **1** | pic\_uuid | uuid | No | /admins/users/ GET |
| **2** | deposit | Str (Decimal) | No |  |

### 