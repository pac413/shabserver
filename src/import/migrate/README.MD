# Migration

## Useful commands

```sh
# DELETE All data and Migrate all the data
DELETE_ALL=true MIGRATE=all npm run local

# Migrate Profiles (Optional: OFFSET, LIMIT)
MIGRATE=bulkProfiles OFFSET=0 LIMIT=10 npm run local

# Migrate Profile Settings (Optional: OFFSET, LIMIT)
MIGRATE=bulkProfileSettings OFFSET=0 LIMIT=10 npm run local

# Migrate single profile and refresh its related data
MIGRATE=fullProfile PROFILE_ID=3b506ac8-889a-4fa0-bf4c-fab82c03ddcb npm run local

# Migrate single profile
MIGRATE=profile PROFILE_ID=3b506ac8-889a-4fa0-bf4c-fab82c03ddcb npm run local

# Migrate single profile settings
MIGRATE=profileSettings PROFILE_ID=3b506ac8-889a-4fa0-bf4c-fab82c03ddcb npm run local
```
