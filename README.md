# IE3142 DevSecOps Juice Shop

## Project Overview

This project is part of the **IE3142 DevOps Security** module.

The project uses **OWASP Juice Shop** as the vulnerable application and focuses on identifying, exploiting, fixing, and testing security vulnerabilities using DevSecOps practices.

The application has been containerized using Docker and Docker Compose.

---

## Application Setup

The project contains the Juice Shop application and Docker configuration.

### Project Structure

```text
IE3142-DevSecOps-JuiceShop/
│
├── docker-compose.yml
│
├── juice-shop/
│   ├── routes/
│   ├── models/
│   ├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.ts
│   └── ...
│
└── evidence/
    └── vulnerability-1-sql-injection/
        ├── before/
        ├── after/
        └── sast/
            ├── before/
            └── after/
```

---

## Running the Application

The application can be built and started using Docker Compose.

```bash
docker compose up --build
```

After the container starts successfully, the application is available at:

```text
http://localhost:3000
```

To stop the application:

```bash
docker compose down
```

---

# Member 1 Work

## 1. Docker Application Setup

The Juice Shop application was configured and tested using Docker.

The existing Dockerfile and Docker Compose configuration were used to build and run the application locally.

The application was successfully built using:

```bash
docker compose up --build
```

The application server successfully started on port `3000`.

---

## 2. SQL Injection Vulnerability

The first security vulnerability investigated was **SQL Injection** in the Juice Shop login functionality.

The vulnerable code was located in:

```text
juice-shop/routes/login.ts
```

The original implementation directly inserted user-controlled input into the SQL query.

The vulnerable query used the following structure:

```typescript
models.sequelize.query(
  `SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' AND deletedAt IS NULL`,
  {
    model: UserModel,
    plain: true
  }
)
```

Because the email value was directly inserted into the SQL statement, the input could be manipulated to change the SQL query.

---

## 3. SQL Injection Exploitation

The vulnerability was tested against the locally running Juice Shop application.

The following payload was entered into the email field:

```text
' OR 1=1--
```

The password used for the test was:

```text
test
```

The SQL Injection attack successfully bypassed the normal login process.

The application indicated that the login challenge was successfully solved.

The authenticated session also provided access to the administrative user profile.

Evidence of the successful exploitation is stored in:

```text
evidence/vulnerability-1-sql-injection/before/
```

---

## 4. SQL Injection Fix

The vulnerable SQL query was changed to use parameterized query replacements.

The fixed implementation uses:

```typescript
models.sequelize.query(
  'SELECT * FROM Users WHERE email = :email AND password = :password AND deletedAt IS NULL',
  {
    replacements: {
      email: req.body.email || '',
      password: security.hash(req.body.password || '')
    },
    model: UserModel,
    plain: true
  }
)
```

Instead of directly inserting the user input into the SQL statement, the values are passed separately using Sequelize `replacements`.

This prevents the input from being interpreted as SQL syntax.

---

## 5. Testing After the Fix

After applying the fix, the Docker application was rebuilt:

```bash
docker compose up --build
```

Normal login functionality was tested and continued to work.

The exact same SQL Injection payload was then tested again:

```text
' OR 1=1--
```

The SQL Injection login bypass was no longer successful after the fix.

The after-fix evidence is stored in:

```text
evidence/vulnerability-1-sql-injection/after/
```

This demonstrates that the vulnerability was first exploited, then fixed, and finally tested again using the same attack input.

---

## 6. SAST Using Semgrep

Semgrep was selected as the Static Application Security Testing (SAST) tool.

The Semgrep version used was:

```text
1.177.0
```

The application was scanned using:

```bash
semgrep --config=auto juice-shop
```

---

## 7. SAST Before the Fix

A Semgrep scan was performed before fixing the SQL Injection vulnerability.

The scan detected the SQL Injection issue in:

```text
juice-shop/routes/login.ts
```

The finding was related to user-controlled input being used in a Sequelize SQL statement.

The complete SAST output was saved to:

```text
evidence/vulnerability-1-sql-injection/sast/before/semgrep-before.txt
```

---

## 8. SAST After the Fix

After the SQL Injection vulnerability was fixed, Semgrep was executed again using:

```bash
semgrep --config=auto juice-shop
```

The resulting scan was saved to:

```text
evidence/vulnerability-1-sql-injection/sast/after/semgrep-after.txt
```

The before and after scan results can be compared to demonstrate the effect of the remediation.

---

## 9. Evidence

The SQL Injection evidence is organized as follows:

```text
evidence/
└── vulnerability-1-sql-injection/
    │
    ├── before/
    │
    ├── after/
    │
    └── sast/
        ├── before/
        │   └── semgrep-before.txt
        │
        └── after/
            └── semgrep-after.txt
```

The evidence contains screenshots and SAST output showing:

- SQL Injection malicious input
- Successful exploitation before the fix
- Administrative access obtained through the vulnerability
- The same payload tested after the fix
- Failed exploitation after remediation
- Semgrep results before remediation
- Semgrep results after remediation

---

## 10. Tools Used for This Work

| Tool | Purpose |
|------|---------|
| OWASP Juice Shop | Vulnerable application |
| Docker | Application containerization |
| Docker Compose | Building and running the application |
| Git | Version control |
| GitHub | Repository and collaboration |
| Semgrep | Static Application Security Testing |

---

## 11. Branch

The work described above was developed on the:

```text
member1
```

branch.

The SQL Injection remediation and related evidence were committed to this branch before being merged into the shared project branch.
