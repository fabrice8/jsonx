JSONX
==========

Javascript Object Notation &amp; More



```js
{
  // define variables
  $name: "Farmok",
  $fakeuser: @import https://fakerapi.it/api/v1/users?_quantity=1&_gender=male|{total,data},
  $account: @import ./account.json,
  
  "fistName": "Jeanette",
  "lastName": $name,

  // Assign variable content
  "email": $fakeuser.data.$0.email,
  "ip": $fakeuser.data.$0.ip,

  // Fetch data directly from URL
  "address": @import https://fakerapi.it/api/v1/addresses?_quantity=1,

  // Assign a sub-data in object format
  "settings": $account.settings|{theme,language},

  "types": [ $account.type, "LEARNER" ],
  
  "credentials": {
    // Use JS spreading syntax
    "roles": `[ ...$account.roles, "USER" ]`
  },

  /* Double quote comment is supported */

  // Run JS code and assign result
  $authorization: `$account.isConnected ? "yes" : fetch("https://mytheme.net/auth?userid=Io90dUQ32d")`,

  "isConnected": $authorization
}
```
