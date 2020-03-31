
# BridgetteDB 

## About:

BridgetteDB is a lightweight, key value store database built on top of the ethereum blockchain built for nodeJS. It sets and retrives values to a key. 


## Use

To use the system, you will need an ethereum node or RPC endpoint for communitcation. To set a kvs you will need to have an account which can be unlocked

### Install

install using a packge manager

`yarn add @chipprbots/bridgetteDB`
`npm install -s @chipprbots/bridgetteDB`

### Enable
To use BridgetteDB, require it within a script and create a new instance of the DB agent. All values are strings.

```
var bdb = require('@chipprbots/bridgetteDB');
var db = new bdb({ 
  "nodeAddr": url of the ethereum node,
  "accountAddress": ethereum account to use for transactions, 
  "accountPasswd" : ethereum account password, 
  "kvsAddr" : address the kvs is deployed to, "0x57EEB5d4D3E1Ac75D51067AE2dCF78922CF3F189", 
  "DBKEY": user assigned unique key for storage
  })
```
## Functions

### Get

 Given a key, retrevis any data stored within the DB
 `db.get( _Key)` 

### Set
 Given a key and Value, stores the value in the DB using the Key
  `db.set( _key, _value)` 

### Remove
   Given a key, remove a DB entry
   'db.rem( _key )`
