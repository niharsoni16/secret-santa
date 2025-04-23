# 🎁 Secret Santa Assignment - Angular App

This project allows you to assign Secret Santa partners to employees by uploading two Excel files:

1. **Employee List** - Names and emails of participants
2. **Past Record** - Last year’s Secret Santa history (to avoid duplicate pairings)

---

## 🚀 Features

- Upload **multiple Excel files** (`.xlsx`)
- Detect and parse:
  - Employee data (`name`, `email`)
  - Past assignments (`name`, `email`, `secretChild`, `secretEmail`)
- Automatically assign Secret Santa in a circular fashion
- Avoid repeating last year's assignments
- Download the final pairings as an Excel file
- Visual feedback ✅❌ on file format
- Option to **clear data** and reset
- Basic responsive UI with clean layout
- Stored Uploaded file Data in Localstorage and had done calculation from there.

---

## 🧠 Approach & Logic

🔹 1. Circular Assignment
        We assign the next person in the list as the current person's Secret Santa:
        ```ts
        A → B, B → C, ..., Y → Z, Z → A

🔹 2. Violation Detection
        We checked below conditions:
       - If someone is assigned to themselves
       - If the current assignment was present in the past record
       - Violations are flagged using a flag property.

🔹 3. Violation Handling
        Single Violation: Swap with another non-violating assignment.
        Multiple Violations: Pairwise swap violating entries until all are valid.

🔹 4. Dynamic File Type Detection
        Using header length:
        - 2 columns → Employee List
        - 4 columns → Past Record

🔹 5. UI Indicators
        ✅ Valid file format
        ❌ Invalid or unsupported format

📁 Sample Excel Structure
        Employee List:

        Name  &	 Email
        John Doe	    john.doe@example.com
        Alice Smith	    alice.smith@example.com
        
        
        Past Record:
        Name - Email - Secret Child - Secret Email
        John Doe	john.doe@example.com	Alice Smith	alice.smith@example.com

✅ Best Practices Followed
        Separated logic into reusable helper functions
        Used localStorage for temporary data persistence
        Avoided hard-coded file names or formats
        Used File interface for better type safety
        Clean UI with conditionally rendered elements
        Responsive and scalable approach to handle real-world team sizes & group wise in future

🧪 How to Test
        Install Angular dependencies (npm i)
        Run the Angular app (npm run start)
        open "http://localhost:4200/"

        All logic for calculations and UI rendering is contained within the src/app/app.component.ts and src/app/app.component.html files.

        Upload two files:
        One for current employees
        One for last year’s assignment

        Click "Calculate" to generate pairings
        Click "Download" to export the result

        Use "Clear Storage" to remove from local storage
