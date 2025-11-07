# Dashboard API Documentation

## Overview
The dashboard provides role-based views for users and government officials to manage traffic violations.

## Endpoints

### Government Dashboard Summary
**GET /api/dashboard/gov/summary**

Returns summary statistics for government users.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "date": "2025-11-07",
  "new_verified_today": 5,
  "total_violations_today": 12,
  "total_outstanding_challans": 45,
  "violations_by_type": [
    {
      "code": 101,
      "text": "Speeding above limit",
      "count": 8
    }
  ]
}
```

**Authentication:** Required (government role)

### User Dashboard Summary
**GET /api/dashboard/user**

Returns summary statistics for regular users.

**Response:**
```json
{
  "totalViolations": 3,
  "verifiedCount": 1,
  "outstandingChallans": 2,
  "totalCredits": 150
}
```

**Authentication:** Required (user role)

## Environment Variables
- `PAGE_SIZE_DEFAULT`: Default page size for pagination (default: 20)
- `JWT_SECRET`: Secret for JWT token verification
- `USE_MONGO`: Set to 'true' to use MongoDB store
- `STORAGE_DIR`: Directory for JSON store (default: './storage')

## Frontend Integration

### Role-Based Routing
```javascript
// In App.jsx or router
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== requiredRole) return <Navigate to="/unauthorized" />;
  return children;
};

// Usage
<Route path="/gov/dashboard" element={
  <ProtectedRoute requiredRole="government">
    <GovDashboard />
  </ProtectedRoute>
} />
```

### Dashboard Components
- **GovDashboard**: Summary cards, violations chart, filters panel, violations table
- **UserDashboard**: Personal violations summary, links to detailed views
- **FiltersPanel**: Date range, verified status, violation type, search
- **ViolationsTable**: Paginated table with sorting and actions

## Testing
Run backend tests: `npm test`
Run frontend tests: `npm test` (in frontend directory)

## Migration to MongoDB
1. Set `USE_MONGO=true` in environment
2. Provide `MONGO_URI` in environment
3. Restart server
4. Data will be stored in MongoDB collections instead of JSON files
