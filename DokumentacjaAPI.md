# API Documentation

## Authentication

### Login

Authenticates a user and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "token": "string",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string"
}
```

- **Error Response**:
  - **Code**: 401 UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "Unauthorized"
}
```

### Create Sale Transaction

Creates a new sale transaction (selling items to customer).

- **URL**: `/api/transactions/sale`
- **Method**: `POST`
- **Authorization**: Required (JWT Token)
- **Request Body**:
```json
{
  "customerId": "integer", // Optional
  "items": [
    {
      "itemId": "integer",
      "sellingPrice": "number"
    }
  ],
  "notes": "string"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Created TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "sale",
  "totalAmount": "number",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```
  OR
  - **Code**: 401 UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "Unauthorized"
}
```

### Create Pawn Transaction

Creates a new pawn transaction.

- **URL**: `/api/transactions/pawn`
- **Method**: `POST`
- **Authorization**: Required (JWT Token)
- **Request Body**:
```json
{
  "customerId": "integer", // Optional if newCustomer is provided
  "newCustomer": { // Optional if customerId is provided
    "firstName": "string",
    "lastName": "string",
    "idType": "string", // enum: passport, driver_license, id_card, other
    "idNumber": "string",
    "doNotServe": "boolean"
  },
  "pawnDurationDays": "integer",
  "interestRate": "number",
  "items": [
    {
      "categoryId": "integer",
      "name": "string",
      "description": "string",
      "serialNumber": "string",
      "brand": "string",
      "model": "string",
      "condition": "string",
      "loanAmount": "number"
    }
  ],
  "notes": "string"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Created TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "pawn",
  "totalAmount": "number",
  "pawnDurationDays": "integer",
  "interestRate": "number",
  "redemptionPrice": "number",
  "expiryDate": "date",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```
  OR
  - **Code**: 401 UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "Unauthorized"
}
```

### Create Redemption Transaction

Creates a new redemption transaction (customer redeeming pawned items).

- **URL**: `/api/transactions/redemption`
- **Method**: `POST`
- **Authorization**: Required (JWT Token)
- **Request Body**:
```json
{
  "pawnTransactionId": "integer",
  "notes": "string"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Created TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "redemption",
  "totalAmount": "number",
  "relatedTransactionId": "integer",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```
  OR
  - **Code**: 401 UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "Unauthorized"
}
```

### Delete Transaction

Deletes a transaction.

- **URL**: `/api/transactions/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Delete Transaction with Cascade

Deletes a transaction and clears all related transaction references.

- **URL**: `/api/transactions/{id}/cascade`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Update Transaction Type

Updates a transaction's type (e.g., from purchase to sale, or from pawn to redemption).

- **URL**: `/api/transactions/{id}/type`
- **Method**: `PATCH`
- **URL Parameters**: `id=[integer]`
- **Authorization**: Required (JWT Token)
- **Request Body**:
```json
{
  "newType": "string", // Target transaction type (e.g., "sale", "redemption")
  "notes": "string", // Optional notes
  "finalPrice": "number", // Optional final price for sales
  "employeeId": "integer" // Optional employee ID for the transaction
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Updated TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "string",
  "totalAmount": "number",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```
  OR
  - **Code**: 401 UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "Unauthorized"
}
```

## Items

### Get Items by Category

Retrieves all transaction items that belong to a specific category.

- **URL**: `/api/items/by-category/{categoryId}`
- **Method**: `GET`
- **URL Parameters**: `categoryId=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionItemDTO objects
```json
[
  {
    "id": "integer",
    "itemId": "integer",
    "itemName": "string",
    "description": "string",
    "price": "number",
    "brand": "string",
    "model": "string",
    "serialNumber": "string",
    "condition": "string",
    "categoryId": "integer",
    "askingPrice": "number"
  }
]
```

## Error Codes

- **200 OK**: Request succeeded
- **201 CREATED**: Resource created successfully
- **204 NO CONTENT**: Request succeeded but no content to return
- **400 BAD REQUEST**: Invalid request data
- **401 UNAUTHORIZED**: Authentication required or failed
- **404 NOT FOUND**: Resource not found
- **409 CONFLICT**: Conflict with current state of resource
- **500 INTERNAL SERVER ERROR**: Server error

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Notes

1. **Date Format**: All dates should be in ISO format (YYYY-MM-DD)
2. **Numbers**: Decimal numbers should be provided as numbers or strings with appropriate precision
3. **Enums**: 
   - Customer ID Types: `passport`, `driver_license`, `id_card`, `other`
   - Employee Status: `active`, `inactive`, `on_leave`, `terminated`
   - Transaction Types: `purchase`, `sale`, `pawn`, `redemption`, `forfeiture`
   - Item Status: `in_inventory`, `pawned`, `sold`, `redeemed`, `forfeited`
4. **Parent-Child Categories**: Categories can have parent-child relationships through the `parentCategoryId` field
5. **Transaction Relationships**: Redemption and forfeiture transactions are linked to their original pawn transactions through `relatedTransactionId`
6. **Customer Creation**: For purchase and pawn transactions, you can either provide an existing `customerId` or create a new customer by providing `newCustomer` data UNAUTHORIZED
  - **Content**: 
```json
{
  "error": "User not found"
}
```
OR
```json
{
  "error": "Invalid password"
}
```
OR
```json
{
  "error": "User is disabled"
}
```

## Categories

### Get All Categories

Retrieves all categories.

- **URL**: `/api/categories`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of CategoryDTO objects
```json
[
  {
    "id": "integer",
    "categoryName": "string",
    "description": "string",
    "parentCategoryId": "integer"
  }
]
```

### Get Category by ID

Retrieves a specific category by its ID.

- **URL**: `/api/categories/{id}`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "id": "integer",
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Get Category by Name

Retrieves a specific category by its name.

- **URL**: `/api/categories/name/{categoryName}`
- **Method**: `GET`
- **URL Parameters**: `categoryName=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "id": "integer",
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Create Category

Creates a new category.

- **URL**: `/api/categories`
- **Method**: `POST`
- **Request Body**:
```json
{
  "id": "integer", // Optional - for setting specific ID
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer" // Optional - for subcategories
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: The created CategoryDTO
```json
{
  "id": "integer",
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer"
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Update Category

Updates an existing category.

- **URL**: `/api/categories/{id}`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
```json
{
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer" // Optional - for parent-child relationships
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: The updated CategoryDTO
```json
{
  "id": "integer",
  "categoryName": "string",
  "description": "string",
  "parentCategoryId": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND
  OR
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Delete Category

Deletes a category.

- **URL**: `/api/categories/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Query Parameters**: `cascade=[boolean]` (optional, default: false)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

## Customers

### Get All Customers

Retrieves all customers.

- **URL**: `/api/customers`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of CustomerDTO objects
```json
[
  {
    "id": "integer",
    "firstName": "string",
    "lastName": "string",
    "idType": "string", // enum: passport, driver_license, id_card, other
    "idNumber": "string",
    "registrationDate": "date",
    "doNotServe": "boolean"
  }
]
```

### Get Customer by ID

Retrieves a specific customer by ID.

- **URL**: `/api/customers/{id}`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: CustomerDTO
```json
{
  "id": "integer",
  "firstName": "string",
  "lastName": "string",
  "idType": "string",
  "idNumber": "string",
  "registrationDate": "date",
  "doNotServe": "boolean"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Search Customers by Name

Searches for customers whose name contains the search string.

- **URL**: `/api/customers/search`
- **Method**: `GET`
- **Query Parameters**: `name=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of CustomerDTO objects
```json
[
  {
    "id": "integer",
    "firstName": "string",
    "lastName": "string",
    "idType": "string",
    "idNumber": "string",
    "registrationDate": "date",
    "doNotServe": "boolean"
  }
]
```
- **Error Response**:
  - **Code**: 204 NO CONTENT (if no customers found)

### Get Do Not Serve Customers

Retrieves all customers flagged as "do not serve".

- **URL**: `/api/customers/do-not-serve`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of CustomerDTO objects
```json
[
  {
    "id": "integer",
    "firstName": "string",
    "lastName": "string",
    "idType": "string",
    "idNumber": "string",
    "registrationDate": "date",
    "doNotServe": true
  }
]
```

### Create Customer

Creates a new customer.

- **URL**: `/api/customers`
- **Method**: `POST`
- **Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "idType": "string", // enum: passport, driver_license, id_card, other
  "idNumber": "string",
  "doNotServe": "boolean"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: The created CustomerDTO
```json
{
  "id": "integer",
  "firstName": "string",
  "lastName": "string",
  "idType": "string",
  "idNumber": "string",
  "registrationDate": "date",
  "doNotServe": "boolean"
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST

### Delete Customer

Deletes a customer.

- **URL**: `/api/customers/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Flag Customer

Updates a customer's "do not serve" flag.

- **URL**: `/api/customers/{id}/flag`
- **Method**: `PATCH`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
```json
{
  "doNotServe": "boolean"
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated CustomerDTO
```json
{
  "id": "integer",
  "firstName": "string",
  "lastName": "string",
  "idType": "string",
  "idNumber": "string",
  "registrationDate": "date",
  "doNotServe": "boolean"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

## Employees

### Get All Employees

Retrieves all employees.

- **URL**: `/api/employees`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of EmployeeDTO objects
```json
[
  {
    "id": "integer",
    "login": "string",
    "firstName": "string",
    "lastName": "string",
    "role": {
      "id": "integer",
      "roleName": "string",
      "description": "string",
      "permissionsLevel": "integer",
      "maxBuy": "integer"
    },
    "hireDate": "date",
    "address": "string",
    "phoneNumber": "string",
    "email": "string",
    "status": "string" // enum: active, inactive, on_leave, terminated
  }
]
```

### Get Employee by ID

Retrieves a specific employee by ID.

- **URL**: `/api/employees/{id}`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: EmployeeDTO
```json
{
  "id": "integer",
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "role": {
    "id": "integer",
    "roleName": "string",
    "description": "string",
    "permissionsLevel": "integer",
    "maxBuy": "integer"
  },
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Search Employees by Name

Searches for employees whose name contains the search string.

- **URL**: `/api/employees/search`
- **Method**: `GET`
- **Query Parameters**: `name=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of EmployeeDTO objects
```json
[
  {
    "id": "integer",
    "login": "string",
    "firstName": "string",
    "lastName": "string",
    "role": {
      "id": "integer",
      "roleName": "string"
    },
    "hireDate": "date",
    "address": "string",
    "phoneNumber": "string",
    "email": "string",
    "status": "string"
  }
]
```
- **Error Response**:
  - **Code**: 204 NO CONTENT (if no employees found)

### Get Employees by Status

Retrieves all employees with a specific status.

- **URL**: `/api/employees/status/{status}`
- **Method**: `GET`
- **URL Parameters**: `status=[string]` (active, inactive, on_leave, terminated)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of EmployeeDTO objects
```json
[
  {
    "id": "integer",
    "login": "string",
    "firstName": "string",
    "lastName": "string",
    "role": {
      "id": "integer",
      "roleName": "string"
    },
    "hireDate": "date",
    "address": "string",
    "phoneNumber": "string",
    "email": "string",
    "status": "string"
  }
]
```

### Create Employee

Creates a new employee.

- **URL**: `/api/employees`
- **Method**: `POST`
- **Request Body**:
```json
{
  "login": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "roleId": "integer",
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string" // enum: active, inactive, on_leave, terminated
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: The created EmployeeDTO
```json
{
  "id": "integer",
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "role": {
    "id": "integer",
    "roleName": "string",
    "description": "string",
    "permissionsLevel": "integer",
    "maxBuy": "integer"
  },
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string"
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Update Employee

Updates an existing employee.

- **URL**: `/api/employees/{id}`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
```json
{
  "login": "string",
  "password": "string", // Optional, only include if changing
  "firstName": "string",
  "lastName": "string",
  "roleId": "integer",
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string" // enum: active, inactive, on_leave, terminated
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: The updated EmployeeDTO
```json
{
  "id": "integer",
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "role": {
    "id": "integer",
    "roleName": "string",
    "description": "string",
    "permissionsLevel": "integer",
    "maxBuy": "integer"
  },
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND
  OR
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Delete Employee

Deletes an employee.

- **URL**: `/api/employees/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Update Employee Status

Updates an employee's status.

- **URL**: `/api/employees/{id}/status`
- **Method**: `PATCH`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
```json
{
  "status": "string" // enum: active, inactive, on_leave, terminated
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated EmployeeDTO
```json
{
  "id": "integer",
  "login": "string",
  "firstName": "string",
  "lastName": "string",
  "role": {
    "id": "integer",
    "roleName": "string",
    "description": "string",
    "permissionsLevel": "integer",
    "maxBuy": "integer"
  },
  "hireDate": "date",
  "address": "string",
  "phoneNumber": "string",
  "email": "string",
  "status": "string"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

## Roles

### Get All Roles

Retrieves all roles.

- **URL**: `/api/roles`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of RoleDTO objects
```json
[
  {
    "id": "integer",
    "roleName": "string",
    "description": "string",
    "permissionsLevel": "integer",
    "maxBuy": "integer"
  }
]
```

### Get Role by ID

Retrieves a specific role by ID.

- **URL**: `/api/roles/{id}`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: RoleDTO
```json
{
  "id": "integer",
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Get Role by Name

Retrieves a specific role by name.

- **URL**: `/api/roles/name/{roleName}`
- **Method**: `GET`
- **URL Parameters**: `roleName=[string]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: RoleDTO
```json
{
  "id": "integer",
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Create Role

Creates a new role.

- **URL**: `/api/roles`
- **Method**: `POST`
- **Request Body**:
```json
{
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: The created RoleDTO
```json
{
  "id": "integer",
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Update Role

Updates an existing role.

- **URL**: `/api/roles/{id}`
- **Method**: `PUT`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
```json
{
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: The updated RoleDTO
```json
{
  "id": "integer",
  "roleName": "string",
  "description": "string",
  "permissionsLevel": "integer",
  "maxBuy": "integer"
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND
  OR
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```

### Delete Role

Deletes a role.

- **URL**: `/api/roles/{id}`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: 
```json
{
  "deleted": true
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND
  OR
  - **Code**: 409 CONFLICT
  - **Content**: 
```json
{
  "deleted": false,
  "error": "string"
}
```

## Transactions

### Get All Transactions

Retrieves all transactions.

- **URL**: `/api/transactions`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionDTO objects
```json
[
  {
    "id": "integer",
    "customerId": "integer",
    "customerName": "string",
    "employeeId": "integer",
    "employeeName": "string",
    "transactionDate": "date",
    "transactionType": "string", // enum: purchase, sale, pawn, redemption, forfeiture
    "totalAmount": "number",
    "pawnDurationDays": "integer",
    "interestRate": "number",
    "redemptionPrice": "number",
    "expiryDate": "date",
    "relatedTransactionId": "integer",
    "notes": "string",
    "items": [
      {
        "id": "integer",
        "itemId": "integer",
        "itemName": "string",
        "description": "string",
        "price": "number",
        "brand": "string",
        "model": "string",
        "serialNumber": "string",
        "condition": "string",
        "categoryId": "integer",
        "askingPrice": "number"
      }
    ]
  }
]
```

### Get Transaction by ID

Retrieves a specific transaction by ID.

- **URL**: `/api/transactions/{id}`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "string",
  "totalAmount": "number",
  "pawnDurationDays": "integer",
  "interestRate": "number",
  "redemptionPrice": "number",
  "expiryDate": "date",
  "relatedTransactionId": "integer",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 404 NOT FOUND

### Get Transactions by Customer

Retrieves all transactions for a specific customer.

- **URL**: `/api/transactions/customer/{customerId}`
- **Method**: `GET`
- **URL Parameters**: `customerId=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionDTO objects
```json
[
  {
    "id": "integer",
    "customerId": "integer",
    "customerName": "string",
    "employeeId": "integer",
    "employeeName": "string",
    "transactionDate": "date",
    "transactionType": "string",
    "totalAmount": "number",
    "pawnDurationDays": "integer",
    "interestRate": "number",
    "redemptionPrice": "number",
    "expiryDate": "date",
    "relatedTransactionId": "integer",
    "notes": "string",
    "items": [
      {
        "id": "integer",
        "itemId": "integer",
        "itemName": "string",
        "description": "string",
        "price": "number",
        "brand": "string",
        "model": "string",
        "serialNumber": "string",
        "condition": "string",
        "categoryId": "integer",
        "askingPrice": "number"
      }
    ]
  }
]
```
- **Error Response**:
  - **Code**: 404 NOT FOUND (if customer not found)

### Get Transactions by Type

Retrieves all transactions of a specific type.

- **URL**: `/api/transactions/type/{type}`
- **Method**: `GET`
- **URL Parameters**: `type=[string]` (purchase, sale, pawn, redemption, forfeiture)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionDTO objects
```json
[
  {
    "id": "integer",
    "customerId": "integer",
    "customerName": "string",
    "employeeId": "integer",
    "employeeName": "string",
    "transactionDate": "date",
    "transactionType": "string",
    "totalAmount": "number",
    "pawnDurationDays": "integer",
    "interestRate": "number",
    "redemptionPrice": "number",
    "expiryDate": "date",
    "relatedTransactionId": "integer",
    "notes": "string",
    "items": [
      {
        "id": "integer",
        "itemId": "integer",
        "itemName": "string",
        "description": "string",
        "price": "number",
        "brand": "string",
        "model": "string",
        "serialNumber": "string",
        "condition": "string",
        "categoryId": "integer",
        "askingPrice": "number"
      }
    ]
  }
]
```

### Get Transactions by Date Range

Retrieves all transactions within a specific date range.

- **URL**: `/api/transactions/date-range`
- **Method**: `GET`
- **Query Parameters**: 
  - `startDate=[ISO date]` (format: YYYY-MM-DD)
  - `endDate=[ISO date]` (format: YYYY-MM-DD)
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionDTO objects
```json
[
  {
    "id": "integer",
    "customerId": "integer",
    "customerName": "string",
    "employeeId": "integer",
    "employeeName": "string",
    "transactionDate": "date",
    "transactionType": "string",
    "totalAmount": "number",
    "pawnDurationDays": "integer",
    "interestRate": "number",
    "redemptionPrice": "number",
    "expiryDate": "date",
    "relatedTransactionId": "integer",
    "notes": "string",
    "items": [
      {
        "id": "integer",
        "itemId": "integer",
        "itemName": "string",
        "description": "string",
        "price": "number",
        "brand": "string",
        "model": "string",
        "serialNumber": "string",
        "condition": "string",
        "categoryId": "integer",
        "askingPrice": "number"
      }
    ]
  }
]
```

### Get Active Pawns by Customer

Retrieves all active pawns for a specific customer.

- **URL**: `/api/transactions/pawns/active/{customerId}`
- **Method**: `GET`
- **URL Parameters**: `customerId=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Array of TransactionDTO objects
```json
[
  {
    "id": "integer",
    "customerId": "integer",
    "customerName": "string",
    "employeeId": "integer",
    "employeeName": "string",
    "transactionDate": "date",
    "transactionType": "pawn",
    "totalAmount": "number",
    "pawnDurationDays": "integer",
    "interestRate": "number",
    "redemptionPrice": "number",
    "expiryDate": "date",
    "notes": "string",
    "items": [
      {
        "id": "integer",
        "itemId": "integer",
        "itemName": "string",
        "description": "string",
        "price": "number",
        "brand": "string",
        "model": "string",
        "serialNumber": "string",
        "condition": "string",
        "categoryId": "integer",
        "askingPrice": "number"
      }
    ]
  }
]
```

### Create Purchase Transaction

Creates a new purchase transaction (buying items from customer).

- **URL**: `/api/transactions/purchase`
- **Method**: `POST`
- **Authorization**: Required (JWT Token)
- **Request Body**:
```json
{
  "customerId": "integer", // Optional if newCustomer is provided
  "newCustomer": { // Optional if customerId is provided
    "firstName": "string",
    "lastName": "string",
    "idType": "string", // enum: passport, driver_license, id_card, other
    "idNumber": "string",
    "doNotServe": "boolean"
  },
  "items": [
    {
      "categoryId": "integer",
      "name": "string",
      "description": "string",
      "serialNumber": "string",
      "brand": "string",
      "model": "string",
      "condition": "string",
      "boughtFor": "number",
      "askingPrice": "number"
    }
  ],
  "notes": "string"
}
```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**: Created TransactionDTO
```json
{
  "id": "integer",
  "customerId": "integer",
  "customerName": "string",
  "employeeId": "integer",
  "employeeName": "string",
  "transactionDate": "date",
  "transactionType": "purchase",
  "totalAmount": "number",
  "notes": "string",
  "items": [
    {
      "id": "integer",
      "itemId": "integer",
      "itemName": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "model": "string",
      "serialNumber": "string",
      "condition": "string",
      "categoryId": "integer",
      "askingPrice": "number"
    }
  ]
}
```
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: 
```json
{
  "error": "string"
}
```
  OR
  - **Code**: 401