# Chirp: A Simple Microblogging Site

## Table of Contents
1. [Introduction](#introduction)
2. [Account Creation and User Supports](#account-creation-and-user-supports)
3. [Common Features](#common-features)
4. [User Specific Features](#user-specific-features)

## Introduction
This is Chirp, a place where you can create, edit, and delete posts, as well as interact with them. In addition, fully functional user specific features are also implemented, including creating an account, loggin in, changing user information and password.

**Important: Please refer to the sections above to see which features you can and can't access without logging into an account**

## Account Creation and User Supports
Here is how you get started!

### Account Creation
In order to create an account, click on **Register** on the navigation bar. Then, you will be prompted to enter in your user name, email, and password. When you successfully create an account, you will be redirected to the **Log In** page, and that leads us to...

### Log In and Log out
If you are not logged in, you are able to see the **Log In** tab on the navigation bar. It will lead you to the **Log In** page. Here, you can enter in your credentials, log into your profile and gain access to the user specific features. If you instead want to log out, you can only the the **Log Out** tab on the navigation bar once you are logged in. Click on it, and you will be logged out. You will also be redirected to the **Log In** page.

### Edit Profile Information and Changing Password
If you are logged in, you can see the **My Profile** tab on the navigation bar. Clicks on it, and you will be redirected to a page that displays your profile information. If you click on the **Edit Profile** button, the page layout will change due to some CSS magic, and you can enter in your updated information. Clicking on **Save Changes** or **Update Password** will attempt to change your information. Any errors will be displayed back to you on the page (Old Password not Correct, Confirm New Password does not match, etc.)

## Common Features
Below are the features you can access without logging in. If you try any of the [User Specific Features](#user-specific-features), you will be redirected to the **Log In** page.

### Recent Posts View
The main page defaults to showing the most recent posts. When you first load the website, you should see a page of most recent posts. They are fetched from the database and sorted by their time of creation. There is a limit of 10 posts per page. You can see the older posts by clicking the pagination buttons at the bottom of the page.

### Posts by Like-Count View
If you fancy sorting the post by most liked instead, you can choose that option from the dropdown list above the posts in the main page and click on the **Sort** button. These posts are instead sorted by their number of likes. Your sort option is saved in the session storage. This ensures that when you reload the page, you will still see the posts sorted by most liked. The pagination buttons work as intended, as the next page will be sorted by the number of likes as well.

### Individual Post View
You can view a particular post by clicking on its container. This will take you to a new page, which you can see the post content, as well as the author and when it was posted. Additionally, there should be an **Edit** and a **Delete** button if the post you are viewing belongs to you.

## User Specific Features
Below are the features you can access when logged in. For more information on logging in, go to [Account Creation and User Supports](#account-creation-and-user-supports)

### My Posts View
If you are logged in, you can see the **My Posts** tab on the navigation bar. Clicking on it will brings you to a page akin to the main page, except all of the posts there are yours. This is handy on finding one of your posts to delete or edit. Most of the functionalities from the main page carries over, such as sorting by most liked, liking a post, viewing an individual post by clicking on it, pagination, etc.

### Post Creation
To create a new post, click on the **Create Post** button. This will redirect you to a new page with a text area where you can type in the content of your post. There is an enforced character limit of 4000. You cannot type past this limit, as the text area will simply not register your input past 4000 characters. When the content of the post satisfies you, click on the **Post** button, and you will see your post added to the main page.

### Post Editing
You can see the **Edit** button if you click to view an individual post that belongs to you. When you click on this button, you will be redirected to a page where you can edit the content of the post. One you are satisfied with your edits, click on the **Update** button to save the edited post.

### Post Deleting
You can see the **Delete** button if you click to view an individual post that belongs to you. When you click on this button, the post will be removed, and you will be redirected to the main page.

### Post Liking
You can click on the **Like** button on each post to add one (1) like to the post. If you change your mind, you can click on the button again to remove the like you added on the post. A cooldown is implemented on the button to prevent spamming (which sometimes breaks the database).
