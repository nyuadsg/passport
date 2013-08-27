passport
========

Centralized authentication and user information for RDC operations. To use this, you need to request a clientID & secret from morgante.

#### OAuth
Authentication is done via OAuth, with these endpoints:

* Authorization endpoint: ```http://passport.sg.nyuad.org/visa/oauth/authorize```
* Token enddpoint/exchange: ```http://passport.sg.nyuad.org/visa/oauth/token```

#### Current User
Once authorized, you can request profile information on the currently authed user from the endpoint ```http://passport.sg.nyuad.org/visa/use/info/me```. This must be passed an authorization code (a standard OAuth authenticaed token). It will return a profile.

#### Profiles
You can also request information on any user through the endpoint ```http://passport.sg.nyuad.org/api/info/profile/net9238?client=YOURCLIENTHERE&secret=YOURSECRETHERE```.

If the user is a valid NYUAD user, it will return a profile such as: 
```
{
  "netID": "mp3255",
  "name": "Morgante Pell",
  "groups": [
    "nyuad2016",
    "nyuad"
  ]
}
```

If the user is not valid, you will receive an error: 
```
{
  "type": "user.notexist",
  "message": "user does not exist"
}
```

#### Provider Tokens
Passport authenticates with other services, primarily Google. If your application has the proper scopes, it can receive an access token to access those services.

To get an access token for Google, GET here: ```http://passport.sg.nyuad.org/visa/google/token?access_token=YOURTOKENHERE```, using the access token you obtained for Passport. Please note this token will always be up to date (we handle refreshing it).

This might respond with an error that the user hasn't delegated the necessary scopes from Google, in which case you should redo the authentication flow with Passport.

#### Logout
If you provide a logout button in your application, you might consider propogating that logout action down the stack to Passport & NYU. To do so, just direct the user (with a redirect or link) to ```http://passport.sg.nyuad.org/auth/logout```.
