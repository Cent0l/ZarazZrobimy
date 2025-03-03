# Pawnshop Inventory Management System - Database Model

## 1. Database Structure

### Table `users` (Users)
| Column        | Data Type       | Description                      |
|--------------|----------------|----------------------------------|
| id           | SERIAL PRIMARY KEY | Unique user ID                 |
| username     | VARCHAR(255) UNIQUE | User login                     |
| password_hash| VARCHAR(255)     | Hashed password                 |
| email        | VARCHAR(255) UNIQUE | User email                      |
| role_id      | INT             | Role ID (FK to `roles`)         |

### Table `roles` (User Roles)
| Column  | Data Type       | Description                         |
|---------|----------------|-------------------------------------|
| id      | SERIAL PRIMARY KEY | Unique role ID                   |
| name    | VARCHAR(255) UNIQUE | Role name (e.g., Clerk, Manager) |

### Table `items` (Inventory Items)
| Column        | Data Type       | Description                      |
|--------------|----------------|----------------------------------|
| id           | SERIAL PRIMARY KEY | Unique item ID                 |
| name         | VARCHAR(255)     | Item name                       |
| description  | TEXT             | Item description                |
| price        | DECIMAL(10,2)    | Item price                      |
| condition    | INT CHECK (condition BETWEEN 1 AND 10) | Item condition (1-10) |
| status       | VARCHAR(50)      | Availability status             |
| created_at   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update |

### Table `item_images` (Item Images)
| Column     | Data Type       | Description                      |
|-----------|----------------|----------------------------------|
| id        | SERIAL PRIMARY KEY | Unique image ID                 |
| item_id   | INT REFERENCES items(id) ON DELETE CASCADE | Related item ID |
| url       | VARCHAR(255)     | Image path                      |
| uploaded_by | INT REFERENCES users(id) | Uploaded by user |
| uploaded_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

### Table `item_history` (Item Change History)
| Column     | Data Type       | Description                      |
|------------|----------------|----------------------------------|
| id         | SERIAL PRIMARY KEY | Unique history ID               |
| item_id    | INT REFERENCES items(id) | Related item ID |
| user_id    | INT REFERENCES users(id) | User who made changes |
| action     | VARCHAR(50)      | Action type (add, edit, delete) |
| timestamp  | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Change timestamp |

### Table `notifications` (Notifications)
| Column      | Data Type       | Description                      |
|------------|----------------|----------------------------------|
| id         | SERIAL PRIMARY KEY | Unique notification ID          |
| user_id    | INT REFERENCES users(id) | Notification recipient |
| message    | TEXT             | Notification message            |
| is_read    | BOOLEAN DEFAULT FALSE | Read status                    |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Creation date |

### Table `reports` (Reports)
| Column      | Data Type       | Description                      |
|------------|----------------|----------------------------------|
| id         | SERIAL PRIMARY KEY | Unique report ID                |
| user_id    | INT REFERENCES users(id) | Report generator ID         |
| type       | VARCHAR(50)      | Report type                     |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Report timestamp |
| file_path  | VARCHAR(255)     | Report file path                |

### Table `sessions` (Login Sessions)
| Column     | Data Type       | Description                      |
|------------|----------------|----------------------------------|
| id         | SERIAL PRIMARY KEY | Unique session ID               |
| user_id    | INT REFERENCES users(id) | User ID |
| token      | VARCHAR(255)     | Session token                   |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Start time |
| expires_at | TIMESTAMP       | Expiration time                 |

---

## 2. UML Diagrams

### Use Case Diagram

#### Actors:
1. **Clerk** – Manages items, adds/edits/deletes.
2. **Manager** – Approves changes and generates reports.
3. **Image Uploader** – Adds item images.

**Main Use Cases:**
- User login
- Add a new item
- Edit an item (change price, description, condition, status)
- Add/remove item images
- View item history
- Generate reports
- Send notifications for important changes
- Search and filter items
- Manage users and assign roles

### ERD (Entity-Relationship Diagram)
**Entities:**
- `users` ←→ `roles` (1:N)
- `users` ←→ `items` (1:N, user adds an item)
- `items` ←→ `item_images` (1:N)
- `items` ←→ `item_history` (1:N)
- `users` ←→ `item_history` (1:N, who modified the item)
- `users` ←→ `reports` (1:N, who generates the report)
- `users` ←→ `notifications` (1:N, who receives notifications)
- `users` ←→ `sessions` (1:N, user sessions)

### Sequence Diagram (Login Process)
1. User enters username and password.
2. System checks credentials in `users` table.
3. If valid, generates session token (`sessions`).
4. User gains system access.
5. If invalid, an error message is displayed.

---
