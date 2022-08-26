---
title: Sending a Text Message with Twilio and DB2 SQL
date: 2020-04-23
tags:
    - ibmi
    - sql
    - twilio
---

*Migrated post from [DEV.to](https://dev.to/barrettotte/sending-a-text-message-with-sql-ibmi-4jnj)*

This is going to be a pretty short post, but I thought it would be fun to share this in light of the Twilio + DEV hackathon this month. Honestly, I'm not sure if either project I planned out will be finished in time. This month went by way too fast, so the outlook is not good.

Since I'm still a pretty new IBMi developer, I found that the best way to learn this new world was to take a fun idea and see if it was possible to do with [RPG](https://en.wikipedia.org/wiki/IBM_RPG) and/or [DB2 SQL](https://www.ibm.com/support/knowledgecenter/ssw_ibm_i_71/db2/rbafzintro.htm).
Now I have a handful of arguably useless code snippets for my day job lol...

## Example HTTP Request in DB2 for i

One of the major things that made me fall in love with IBMi was that DB2 was really versatile. The fact that I could easily send HTTP requests with SQL was mind blowing.

For a really basic example, I'm going to do a basic HTTP GET to the GitHub REST API v3 for my user using only SQL. The equivalent CURL command will be 

```bash
#!/bin/bash
curl -i https://api.github.com/users/barrettotte
```

<br>

This HTTP request is super simple because we don't need any HTTP headers.

```sql
values SysTools.HttpGetClob(
  cast('https://api.github.com/users/barrettotte' as varchar(128)), -- url
  cast(null as clob) -- http headers
);
```

The request returns

| 00001                |
| -------------------- |
| '{"login":"barrettotte","id":15623775,"node_id"...}' |

<br>

Ok. That's cool because we can parse the JSON string in another program or something. But, actually we can do some way cooler stuff. We can return the HTTP response as a result set.

Here is a really basic example, I mostly just used varchars for simplicity, but any field could be mapped to any appropriate data type.

```sql
select *
from json_table(
  SysTools.HttpGetClob(
    cast('https://api.github.com/users/barrettotte' as varchar(128)),
    cast(null as clob)
  ),
  '$' columns(
    login          varchar(64)   path 'lax $.login',
    id             varchar(16)   path 'lax $.id',
    node_id        varchar(32)   path 'lax $.node_id',
    avatar_url     varchar(64)   path 'lax $.avatar_url',
    url            varchar(64)   path 'lax $.url',
    html_url       varchar(64)   path 'lax $.html_url',
    followers_url  varchar(64)   path 'lax $.followers_url',
    following_url  varchar(64)   path 'lax $.following_url',
    gists_url      varchar(64)   path 'lax $.gists_url',
    starred_url    varchar(64)   path 'lax $.starred_url',
    subs_url       varchar(64)   path 'lax $.subscriptions_url',
    orgs_url       varchar(64)   path 'lax $.organizations_url',
    repos_url      varchar(64)   path 'lax $.repos_url',
    events_url     varchar(64)   path 'lax $.events_url',
    rcv_events_url varchar(64)   path 'lax $.received_events_url',
    type           varchar(16)   path 'lax $.type',
    site_admin     varchar(8)    path 'lax $.site_admin',
    name           varchar(64)   path 'lax $.name',
    company        varchar(64)   path 'lax $.company',
    blog           varchar(64)   path 'lax $.blog',
    location       varchar(64)   path 'lax $.location',
    email          varchar(64)   path 'lax $.email',
    hireable       varchar(8)    path 'lax $.hireable',
    bio            varchar(512)  path 'lax $.bio',
    public_repos   int           path 'lax $.public_repos',
    public_gists   int           path 'lax $.public_gists',
    followers      int           path 'lax $.followers',
    following      int           path 'lax $.following',
    created_at     varchar(32)   path 'lax $.created_at',
    updated_at     varchar(32)   path 'lax $.updated_at'
  )
);
```

The request returns

| LOGIN       | ID       | NODE_ID    | ... |
| ----------- | -------- | ---------- | --- |
| barrettotte | 15623775 | MDQ6VXN... | ... |

Personally I think this is really neat.

## Calling Twilio from DB2 SQL

I figured I should say I know that this is not an ideal solution for probably a majority of cases. But, this is just a fun thing I'm showing.

The HTTP request I'm going to make looks like this 

```
POST {{base}}/2010-04-01/Accounts/{{account}}/Messages.json HTTP/1.1
Authorization: Basic {{account}}:{{auth}}
Accept: application/json
Content-Type: application/x-www-form-urlencoded

To={{to}}&From={{from}}&Body=Hello+World
```

Calling Twilio takes a few more steps than the previous example. In DB2 for i, you have to pass HTTP headers as XML (I assume its a legacy thing and I wish it was JSON, but its still easy to work with). 

The authorization header has to be passed as a Base64 encoded string. There is a scalar function called **Base64Encode** in **SysTools** that seems to work fine.

Additionally, Twilio wants the request body as a url-encoded string. To my surprise, I learned that **SysTools** also has a scalar function called **UrlEncode**. All of the hard work is done with scalar functions, you just have to piece them together.

I replaced all **secrets** in this query with 'variables' surrounded by double curly braces.

```sql
select *
from json_table(
  SysTools.HttpPostClob(
    'https://api.twilio.com/2010-04-01/Accounts/{{account}}/Messages.json',
    cast((
      '<httpHeader>
        <header name="Authorization" value="Basic ' || trim(SysTools.Base64Encode(
          cast('{{account}}:{{auth}}' as varchar(256) ccsid 1208))) ||
        '"/>
        <header name="Accept" value="application/json"/>
        <header name="Content-Type" value="application/x-www-form-urlencoded"/>
      </httpHeader>'
    ) as clob),
    cast((
      'To='    || SysTools.UrlEncode('{{to}}', 'UTF-8') ||
      '&From=' || SysTools.UrlEncode('{{from}}', 'UTF-8') ||
      '&Body=' || SysTools.UrlEncode('Hello World', 'UTF-8')
    ) as clob)
  ),
  '$' columns(
    sid           varchar(64)   path 'lax $.sid',
    date_created  varchar(64)   path 'lax $.date_created',
    date_updated  varchar(64)   path 'lax $.date_updated',
    date_sent     varchar(64)   path 'lax $.date_sent',
    account_sid   varchar(64)   path 'lax $.account_sid',
    phone_to      varchar(32)   path 'lax $.to',
    phone_from    varchar(32)   path 'lax $.from',
    msg_srv_sid   varchar(64)   path 'lax $.messaging_service_sid',
    body          varchar(1600) path 'lax $.body',
    status        varchar(16)   path 'lax $.status',
    num_segments  varchar(8)    path 'lax $.num_segments',
    num_media     varchar(8)    path 'lax $.num_media',
    direction     varchar(32)   path 'lax $.direction',
    api_version   varchar(16)   path 'lax $.api_version',
    price         varchar(8)    path 'lax $.price',
    price_unit    varchar(4)    path 'lax $.price_unit',
    error_code    varchar(8)    path 'lax $.error_code',
    error_message varchar(512)  path 'lax $.error_message',
    uri           varchar(256)  path 'lax $.uri',
    nested '$.subresource_uris[*]' columns(
      media       varchar(256)  path 'lax $.media'
    )
  )
);
```

The request returns

| SID | DATE_CREATED | DATE_UPDATED | DATE_SENT | ACCOUNT_SID | PHONE_TO | ... |
| --- | ------------ | ------------ | --------- | ----------- | -------- | --- |
| ... | Wed, 22 Apr 2020 23:35:26 +0000 | ... | ... | ... | ... | ... |

## Conclusion

That's kind of it, I thought it was pretty cool and figured I'd share it for anyone browsing around this morning.
The gist can be found [here](https://gist.github.com/barrettotte/8a12130d40882c52a18c14f9a72df12a)

Realistically, I don't know what you would do with this. But, knowing that it exists "might" do some good in some situation.