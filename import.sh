#!/bin/bash
echo "building"
npm run build
echo "running profiles"
IMPORT=profiles node dist/ > /dev/null 2>&1 
echo "running pageviews"
IMPORT=pageviews node dist/ > /dev/null 2>&1 
echo "running features"
IMPORT=features node dist/ > /dev/null 2>&1 
echo "running dates"
IMPORT=dates node dist/ > /dev/null 2>&1 
echo "running endorsements"
IMPORT=endorsements node dist/ > /dev/null 2>&1 
echo "running messages"
IMPORT=messages node dist/ > /dev/null 2>&1 
echo "running friends"
IMPORT=friends node dist/ > /dev/null 2>&1 
echo "running hostings"
IMPORT=hostings node dist/ > /dev/null 2>&1 
echo "done"
exit 0
