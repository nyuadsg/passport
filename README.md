passport
========

Centralized authentication and user information for RDC operations. To use this, you need to request a clientID & secret from morgante.

#### OAuth
Authentication is done via OAuth, with these endpoints:

* Authorization endpoint: ```http://passport.sg.nyuad.org/visa/oauth/authorize```
* Token enddpoint/exchange: ```http://passport.sg.nyuad.org/visa/oauth/token```

#### Current User
Once authorized, you can request profile information on the currently authed user from the endpoint ```http://passport.sg.nyuad.org/visa/use/info/me```. This must be passed an authorization code (a standard OAuth authenticaed token). It will return a #profiles.

#### Profiles
You can also request information on any user through the endpoint ```http://passport.sg.nyuad.org/api/info/profile/net9238?client=YOURCLIENTHERE&secret=YOURSECRETHERE```.

If the user is a valid NYUAD user, it will return a profile such as: 
```
{
  "netID": "mp3255",
  "class": 2016,
  "school": "NYUAD"
}
```

If the user is not valid, you will receive an error: 
```
{
  "type": "user.notexist",
  "message": "user does not exist"
}
```
