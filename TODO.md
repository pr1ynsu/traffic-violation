# TODO: Implement Traffic Violation System Updates

## Backend Updates
- [ ] Update `backend/routes/violations.js` GET `/api/violations` to read from CSV instead of MongoDB, map to camelCase, add `proofImageUrl`

## Frontend Assets
- [ ] Create placeholder image at `frontend/public/images/no-image.png`

## Frontend Components
- [ ] Create `ViolationImage` component at `frontend/src/components/ViolationImage.jsx`
- [ ] Update `RecordsTable.jsx` to use `ViolationImage` component in modal instead of plain img

## Frontend Pages
- [ ] Update `frontend/src/pages/Gov/Violations.jsx` to use `govFetcher` and adjust columns to match CSV fields
- [ ] Update `frontend/src/pages/Gov/Credits.jsx` to use `govFetcher` and adjust columns

## Frontend Utils
- [ ] Update `govFetcher.js` to handle `type="violations"` (return all data like "all")

## Testing
- [ ] Test backend endpoint `/api/violations` returns CSV data with `proofImageUrl`
- [ ] Test frontend pages load data and images display with placeholder fallback
- [ ] Ensure no runtime errors in browser console
