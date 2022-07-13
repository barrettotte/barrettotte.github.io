---
title: ColdFusion Service Pinger
date: 2018-12-01
tags:
    - coldfusion
---

At my job sometimes a few of the legacy services' health in the qa/dev environment decays and there are no robust health checks in place.
So, one morning I coded up a quick and dirty page that product owners could hit to get a sanity check when they were checking features.

In summary, this ColdFusion page hits each listed service in the JSON and uses multithreading.
This was the first time I ever messed around with multithreading in ColdFusion; It was easier than I thought.

`index.cfm`

```
<cfscript>
    serviceTester = new serviceTester();
    writeOutput('
        <h1>Web Service Tester</h1>
        <hr/>
        <p>Very basic method to check web services. <b>Multiple runs are suggested</b></p>
        <form>
            #serviceTester.process()#
            <br>
            <input type="submit" value="Retry">
        </form>
        <br>
        <p>If all services are OK and dev still is not working, 
            <b>then dev most likely needs to be restarted.</b>
        </p>
    ');
</cfscript>
```

<br>

`serviceTester.cfc`

```txt
component{

    public serviceTester function init(){
        local.url = cgi.SERVER_NAME & replace(cgi.SCRIPT_NAME, "index.cfm", "") & "serviceTester.json";
        variables.config = deserializeJSON(httpGet(local.url).send().getPrefix().FileContent);
        return this;
    }

    public string function process(){
        var outHTML = "";
        var size = arrayLen(variables.config.targets);
        var threadList = "";
        this.threadOutput = arrayNew(1); //variables scope makes this work

        for(var i = 1; i <= size;  i++){
            thread action="run" name="thread#i#" index=i payload=variables.config.targets[i] {
                this.threadOutput[index] = makeRow(payload);
            }
            listAppend(threadList, "thread#i#");
        }
        threadJoin(threadList, 15000);

        savecontent variable='outHTML'{
            writeOutput("<table style='border-collapse:separate; border-spacing:25px 0;'>");
            for(var i = 1; i <= size; i++){
                writeOutput(this.threadOutput[i]);
            }
            writeOutput("</table>");
        }
        return outHTML;
    }

    private string function makeCell(required any content, numeric padding=10, string color="black"){
        return "<td style='padding: #arguments.padding#px 0; color:#arguments.color#'>" & arguments.content & "</td>";
    }

    private string function makeRow(required struct payload){
        var response = httpGet(payload.url).send().getPrefix()["Statuscode"];
        var status = response == "200" ? {"text":"OK","color":"green"}:{"text":"DOWN","color":"red"};
        var outHTML = "<tr>"
            & makeCell(content: '<a href="' & payload.url & '">' & payload.name & '</a>')
            & makeCell(content:". . . . . . . .", padding:2)
            & makeCell(content:status.text, color:status.color) & "</tr>";                    
        return outHTML;
    }

    private http function httpGet(required string reqUrl){
        var httpService = new http();
        var timeout = isDefined("variables.config.timeout") ? variables.config.timeout : 200;
        httpService.setTimeOut(timeout);
        httpService.setCharset('utf-8');
        httpService.setMethod("GET");
        httpService.setUrl(arguments.reqUrl);
        return httpService;
    }
}
```

<br>

`serviceTester.json`

```json
{
  "timeout": 5,
  "targets": [
    {
      "name": "Some Service",
      "url": "http://somewhere:123"
    },
    {
      "name": "Some other Service",
      "url": "http://somewhere/else:456"
    }
  ]
}
```