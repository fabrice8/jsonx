# jsonx
============

Javascript Object Notation &amp; More

```jsonx
{
  // variables
  $fakeuser: @import https://fakerapi.it/api/v1/users?_quantity=1&_gender=male|{total,data},
  $account: @import ./account.json,
  
  "name": "Farook",

  // Assign variable content
  "email": $fakeuser.data.$0.email,
  "ip": $fakeuser.data.$0.ip,

  // Fetch data directy from URL
  // "country": @import https://ipconfig.com/221.212.40.66?json=true|{country},

  // Assign a sub-data in object format
  "settings": $account.settings|{theme,language},

  // Use JS spreading syntax
  "types": [ $account.type, "LEARNER" ],
  "roles": `[ ...$account.roles, "USER" ]`,

  /* Double quote comment is supported */

  // Specify JS code to run
  $authorization: `$account.isConnected ? "yes" : fetch("https://mytheme.net/auth?userid=Io90dUQ32d")`,

  "isConnected": $authorization
}
```
