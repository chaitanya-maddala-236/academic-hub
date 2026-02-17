# PR #2 Review Issues - All Resolved

This document summarizes all the fixes applied to resolve the 20 review comments from PR #2.

## Issues Fixed

### 1. Fixed Incorrect 'authenticate' Imports (5 files) ✅
**Issue**: Routes were importing `authenticate` but the middleware exports `verifyToken`, causing runtime errors.

**Files Fixed**:
- `backend/routes/materials.routes.js`
- `backend/routes/awards.routes.js`
- `backend/routes/auth.routes.js`
- `backend/routes/studentProjects.routes.js`
- `backend/routes/consultancy.routes.js`

**Solution**: Changed all imports from `const { authenticate }` to `const { verifyToken }` and updated all route handler usages accordingly.

### 2. Added Input Validation for Required 'title' Field (4 files) ✅
**Issue**: Missing validation for required `title` field could cause database constraint violations.

**Files Fixed**:
- `backend/controllers/awards.controller.js`
- `backend/controllers/materials.controller.js`
- `backend/controllers/consultancy.controller.js`
- `backend/controllers/studentProjects.controller.js`

**Solution**: Added validation checks that return a 400 Bad Request error if title is missing before attempting database insertion:
```javascript
if (!title) {
  return res.status(400).json({
    success: false,
    message: 'Title is required'
  });
}
```

### 3. Fixed MIME Type Validation in Materials Controller ✅
**Issue**: Regex pattern matching on MIME types would incorrectly reject valid document uploads (e.g., 'application/pdf' doesn't match regex `/pdf|ppt|pptx/`).

**File**: `backend/controllers/materials.controller.js`

**Solution**: Replaced regex-based MIME type validation with a whitelist array of actual MIME types:
```javascript
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const mimetype = allowedMimeTypes.includes(file.mimetype);
```

### 4. Fixed Rate Limiter Path ✅
**Issue**: Rate limiter applied to `/api/` (with trailing slash) would not match routes at `/api` level (without trailing slash).

**File**: `backend/server.js`

**Solution**: Removed trailing slash: `app.use('/api', apiLimiter)`

### 5. Fixed Fragile COUNT Query Construction (4 files) ✅
**Issue**: String replacement method for COUNT queries (`queryText.replace('SELECT ...', 'COUNT(*)')`) could fail if the SELECT clause appears elsewhere in the query string.

**Files Fixed**:
- `backend/controllers/awards.controller.js`
- `backend/controllers/consultancy.controller.js`
- `backend/controllers/materials.controller.js`
- `backend/controllers/studentProjects.controller.js`

**Solution**: Created a separate `countQueryText` variable that is built in parallel with the main `queryText`, ensuring both queries share the exact same WHERE conditions:
```javascript
let queryText = `SELECT a.*, ... FROM awards a WHERE 1=1`;
let countQueryText = `SELECT COUNT(*) FROM awards a WHERE 1=1`;

// Add conditions to both queries
if (faculty_id) {
  const condition = ` AND a.faculty_id = $${paramCount}`;
  queryText += condition;
  countQueryText += condition;
  // ...
}
```

### 6. Added Ownership Check for Materials Deletion ✅
**Issue**: Any faculty member could delete any teaching material, not just their own, which is a security concern.

**File**: `backend/controllers/materials.controller.js`

**Solution**: Added ownership verification before deletion:
```javascript
// Check ownership for faculty members (admins can delete any)
if (req.user.role === 'faculty' && material.created_by !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: 'You can only delete your own materials'
  });
}
```

### 7. Added File Cleanup When Materials Are Deleted ✅
**Issue**: When teaching materials are deleted, associated files on disk are not removed, leading to orphaned files accumulating in `uploads/materials/` directory.

**File**: `backend/controllers/materials.controller.js`

**Solution**: Retrieve the material record first, delete from database, then remove the physical file:
```javascript
const material = checkResult.rows[0];
// ... delete from database ...

// Delete associated file if it exists
if (material.file_url) {
  const filePath = path.join(__dirname, '..', material.file_url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
```

### 8. Updated Documentation Version Mismatch ✅
**Issue**: Documentation showed `express-rate-limit: "^7.x.x"` but `package.json` specifies `"^8.2.1"`.

**File**: `IMPLEMENTATION_SUMMARY.md`

**Solution**: Updated version to match `package.json`: `"express-rate-limit": "^8.2.1"`

### 9. Improved Schema.sql Comment Clarity ✅
**Issue**: Comment format about test user passwords could be clearer and more explicit.

**File**: `backend/database/schema.sql`

**Solution**: Improved comment formatting:
```sql
-- Insert default users with pre-generated password hashes
-- Password hashes were generated using bcrypt with 10 salt rounds
-- Default test accounts:
--   admin@vnrvjiet.ac.in  (role: admin, password: Admin@123)
--   faculty@vnrvjiet.ac.in (role: faculty, password: Faculty@123)
--   student@vnrvjiet.ac.in (role: student, password: Student@123)
```

## Summary

All 20 review comments from PR #2 have been addressed with minimal, surgical changes to the codebase:

- ✅ 5 files fixed for authentication middleware imports
- ✅ 4 files fixed for input validation
- ✅ 4 files fixed for robust COUNT query construction
- ✅ 1 file fixed for MIME type validation
- ✅ 1 file fixed for rate limiter path
- ✅ 1 file fixed for ownership checks and file cleanup
- ✅ 2 documentation files updated for accuracy

**Total Files Modified**: 12 files
**Lines Changed**: ~170 additions, ~60 deletions

All changes maintain backward compatibility and follow existing code patterns in the repository.
