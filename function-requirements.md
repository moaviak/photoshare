Requirement ID | Description | User Story | Expected Behavior/Outcome
FR001 | User Registration | As a user, I want to register with the platform so I can access the services. | Users can sign up as Consumers by default using email and password. Account info is securely stored.
FR002 | User Login | As a user, I want to log in to my account so I can use the application. | Users can log in with valid credentials and are issued a JWT token.
FR003 | View Toggle (Creator/Consumer) | As a Creator, I want to toggle between views so I can use Creator tools or browse like a Consumer. | A toggle allows Creator users to switch between Consumer view and Creator view within the same session.
FR004 | Upgrade to Creator | As a Consumer, I want to upgrade to a Creator so I can upload photos. | Consumers can request to become Creators via a UI or auto-upgrade logic, gaining access to upload functionality.
FR005 | Upload Photo (Creator Only) | As a Creator, I want to upload images along with details so they can be shared on the platform. | Only Creators can access the photo upload form. They can upload images and provide metadata like title, caption, location, and tagged users.
FR006 | Store Photo Metadata | As a Creator, I want to attach information to my photos so they are easier to understand and search. | The system saves image metadata: title, caption, location, and people tags when uploading a photo.
FR007 | View Photo Feed | As a Consumer, I want to browse shared images so I can discover content. | Users can see an infinite-scrolling or paginated feed of photo posts in the Consumer view.
FR008 | Search Photos | As a Consumer, I want to search for images using keywords or tags so I can find relevant content. | A search bar allows searching by title, location, or user tags. Results update in real time or on submit.
FR009 | View Single Photo | As a user, I want to view photo details so I can see the image and associated metadata. | Clicking a photo opens a detailed view showing the image, title, caption, location, comments, and ratings.
FR010 | Comment on Photos | As a user, I want to comment on photos so I can share feedback. | Authenticated users can leave comments on any public post. Comments are stored with userId, text, and timestamp.
FR011 | Rate Photos | As a user, I want to rate photos so I can express my appreciation. | Authenticated users can rate each post (e.g. 1 to 5 stars). Each user can rate a post only once.
FR012 | Profile View | As a user, I want to view my profile to manage the content I have uploaded. | Each user has a profile showing their uploaded photos (if Creator) and basic account details.
FR013 | Toggle Public/Private for Posts | As a Creator, I want to set a post as public or private. | Users can control post visibility. Private posts are only visible to the user who uploaded them.
FR014 | Authentication & Role Enforcement | As a system, I want to restrict access to Creator tools only for Creator users. | The backend enforces user roles and permissions through middleware.
FR015 | Toggle View Endpoint | As a Creator, I want an endpoint that updates my current view mode. | A PATCH /users/me/toggle-view endpoint switches the user’s currentView between consumer and creator.
FR016 | File Storage Integration | As a developer, I want to store uploaded images securely and retrieve them fast. | The system uses a cloud file storage solution (Appwrite Bucket). Links are saved in the database.
FR017 | Responsive UI for Web | As a user, I want to use the platform on mobile and desktop devices. | The frontend is responsive and adapts to different screen sizes.
FR018 | REST API for Frontend Integration | As a developer, I want backend endpoints to be accessible via REST APIs. | The server provides RESTful APIs for login, registration, post upload, toggle view, feed, search, etc.
FR019 | Persistent User Sessions | As a user, I want to stay logged in until I log out. | JWT tokens are stored in HTTP-only cookies or local storage for persistent sessions.
FR020 | Secure Password Storage | As a system, I want to store passwords securely. | Passwords are hashed using bcrypt before being stored in the database.
