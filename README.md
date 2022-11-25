# Get It Done!

## Introduction
Just a simple angular/Laravel app to help you get things done and store useful information in organised workspaces

## Installation
### Backend
1. Set up a local dev server that is compatible with Laravel
2. Do a ```composer install``` inside the backend directory
3. Create the database with ```php artisan migrate:fresh``` (The settings are found in .env file, If it doesn't exist create it from [file](backend/.env.example))

### Frontend
1. ```cd frontend```
2. ```npm install --legacy-peer-deps```
3. ```ng serve```
4. Navigate to ```localhost:4200```
5. You may find that it complains about incompatible packages, If so use ```npm install --legacy-peer-deps```

To build the angular frontend for production use ```ng build --configuartion=production```

The platform does send out emails, The email config can be setup in the .env file in backend

To register a user you will need to use the frontend

## Features
- [x] Create workspaces
- [x] Create tasks
- [x] Create notes
- [ ] Create events

## Bugs
- [ ] The knowledgebase sharing is not working correctly, So users who have access to a workspace can't it
- [ ] Task assignment seems to be broken
- [ ] No verification on new users
- [ ] No way to invite users to a workspace on the frontend

## Planned features
- [ ] Create events
- [ ] Create a calendar
- [ ] Create notifications for users push/email/both
- [ ] Create a way to invite users to a workspace
- [ ] Create a way to verify new users
- [ ] Add more to tasks, such as due dates, priority, etc
- [ ] Add a way to add files and images to tasks
- [ ] Add a way to add files and images to knowledgebases
- [ ] Add 2fa

## Contributing
If you would like to contribute to this project please feel free to do so, I will try to review any pull requests as soon as possible

## Acknowledgments
- [Laravel](https://laravel.com/)
- [Angular](https://angular.io/)
- [Bootstrap](https://getbootstrap.com/)
