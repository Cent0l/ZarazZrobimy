# Database Schema

## Customers Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| customer_id | integer | primary key, auto increment, unique | Unique identifier for each customer |
| first_name | varchar(50) | | Customer's first name |
| last_name | varchar(50) | | Customer's last name |
| id_type | enum | | Type of identification document provided |
| id_number | varchar | | Identification document number |
| registration_date | date | | Date when customer was registered in the system |
| do_not_serve | bool | | Flag indicating if the customer should not be served |

## Roles Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| role_id | integer | primary key, auto increment, unique | Unique identifier for each role |
| role_name | integer | unique | Name of the role |
| description | text | nullable | Detailed description of the role |
| permissions_level | integer | | Authorization level for the role |
| max_buy | integer | | Maximum purchase amount authorized for this role |

## Employees Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| employee_id | integer | primary key, auto increment, unique | Unique identifier for each employee |
| login | varchar(50) | | Employee's login username |
| password_hash | varchar(255) | | Hashed password for authentication |
| first_name | varchar(50) | | Employee's first name |
| last_name | varchar(50) | | Employee's last name |
| rank_id | integer | foreign key to Roles.role_id | Employee's assigned role |
| hire_date | date | | Date when employee was hired |
| adress | varchar(100) | | Employee's residential address |
| phone_number | varchar(20) | | Employee's contact phone number |
| email | varchar(50) | nullable | Employee's email address |
| status | enum | | Current employment status |

## Items Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| item_id | integer | primary key, auto increment, unique | Unique identifier for each item |
| category_id | integer | foreign key to Categories.category_id | Category the item belongs to |
| description | text | nullable | Detailed description of the item |
| serial_number | integer | nullable | Item's serial number if available |
| brand | varchar | nullable | Brand or manufacturer of the item |
| model | varchar | nullable | Model name or number of the item |
| condition | varchar | nullable | Physical condition of the item |
| bought_for | decimal | | Amount paid to acquire the item |
| asking_price | decimal | | Selling price of the item |
| reported_stolen | bool | | Flag indicating if item was reported as stolen |

## Transactions Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| transaction_id | integer | primary key, auto increment, unique | Unique identifier for each transaction |
| customer_id | integer | nullable, foreign key to Customers.customer_id | Customer involved in the transaction |
| employee_id | integer | foreign key to Employees.employee_id | Employee who processed the transaction |
| transaction_date | date | | Date when transaction occurred |
| transaction_type | enum | | Type of transaction (purchase, sale, pawn, etc.) |
| total_amount | decimal | | Total monetary value of the transaction |

## Transaction_Items Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| transaction_item_id | integer | primary key, auto increment, unique | Unique identifier for each transaction item |
| transaction_id | integer | foreign key to Transactions.transaction_id | Transaction this item is part of |
| item_id | integer | foreign key to Items.item_id | Item involved in this transaction |
| price | decimal | | Price of the item in this transaction |
| pawn_duration_days | integer | | Duration of pawn in days (for pawn transactions) |
| interest_rate | integer | | Interest rate applied (for pawn transactions) |
| expiry_date | integer | | Date when pawn expires (for pawn transactions) |

## Categories Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| category_id | integer | primary key, auto increment, unique | Unique identifier for each category |
| category_name | varchar(50) | | Name of the item category |
| description | text | | Detailed description of the category |
