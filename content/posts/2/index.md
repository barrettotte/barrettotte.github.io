---
title: ColdFusion cfexecute Example
date: 2018-09-01
tags:
    - coldfusion
---

Since ColdFusion is very similar to PHP, I wanted to mess around with some of the less-used functions.
`cfexecute` is a function that will pop a shell and execute a program.

In this example program, I just made a "wrapper" around `ping`.

`execute.cfc`

```
component name="CF Execute Test" hint="Messing around with cfexecute built in method."{

    public any function init(){
        variables.system32Path = "C:\Windows\system32\";
        variables.commands = {
            "ping": variables.system32Path & "ping.exe"
        };
        return this;
    }

    public struct function getCommandList(){
        return variables.commands;
    }
    public string function getSystem32Path(){
        return variables.system32Path;
    }

    public string function ping(required string target){
        return execute(variables.commands["ping"], arguments.target, 25);
    }

    private string function execute(required string name, any args="", string timeout=0, string outputfile=""){
        local.result = "";
        savecontent variable="result"{
            if(len(outputfile)){
                cfexecute(
                    name=arguments.name,
                    arguments=arguments.args,
                    timeout=arguments.timeout,
                    outputfile=arguments.outputfile
                );
            } else{
                cfexecute(
                    name=arguments.name, 
                    arguments=arguments.args, 
                    timeout=arguments.timeout
                );
            }
        }
        return local.result;
    }
}
```

`execute.cfm`

```
<html>
    <head>
        <style type="text/css">
            .headContainer{
                padding: 10px 0px 20px 0px;
            }
            .container {
                padding: 20px 0px 20px 0px;
            }
            .consoleView {
                padding-left: 10px; 
                padding-right: 10px;
                background-color: black; 
                color: #00FF00;
                font-size: 18px;
            }
            .buttonLabel {
                padding-right: 5px;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <cfset execObj = createObject('component', 'execute').init()/>
        <cfset commandList = execObj.getCommandList()/>
        <div class="headContainer">
            <h2>CF Execute Testing</h2>
            Messing around with the cfexecute built in method.
        </div>
        <hr>
        <form method="get">
            <cfif structCount(commandList) GT 0>
                <div class="container">
                    <h3>Available Command(s):</h3>
                    <ol>
                        <cfloop collection="#commandList#" item="key">
                            <li><cfoutput>#commandList[key]#</cfoutput></li>
                        </cfloop>
                    </ol>
                </div>
                <hr>
            </cfif>
            <div class="container">
                <b class="buttonLabel">Ping</b>
                <input type="text" name="inputData" size="10" max="25" value=""/>
                <input type="submit" value="Go"> 
            </div>
        </form>
        <form method="post">
            <cfif isDefined("inputData") AND inputData NEQ "">
                <div class="container consoleView">
                    <cfoutput>#htmlCodeFormat(execObj.ping(inputData))#</cfoutput>
                    <cfset inputData=""/>
                </div>
            </cfif>
        </form>
        <hr>
    </body>
</html>
```