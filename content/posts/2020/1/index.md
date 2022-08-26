---
title: IBM i Joke Program
date: 2020-02-20
tags:
    - ibmi
    - powershell
---

My coworker found a really cool command called `STRPCCMD` that allows the 
5250 emulator to execute commands on the client machine. So why not exploit it for a laugh...

`joke.clle`

```
/* CALL BOLIB/JOKE */
/* Entry Path: C:\Users\Public\IBM\ClientSolutions */

PGM                                                              
   DCL VAR(&gist) TYPE(*CHAR) LEN(60)                            
   DCL VAR(&cmd)  TYPE(*CHAR) LEN(120)                           
                                                                 
   CHGVAR VAR(&gist) VALUE('https://gist.github.com/' +          
             || 'b6654e5606831f13f48887de39d67723.git')          
                                                                 
   CHGVAR VAR(&cmd) VALUE('cmd /c "git clone ' || &gist || ' x' +
                       || ' & powershell x/joke.ps1"')                           
                                                                 
   STRPCO PCTA(*NO)                                              
   MONMSG MSGID(IWS4010)                                         
   STRPCCMD PCCMD(&cmd) PAUSE(*NO)                               
                               
ENDPGM
```

`joke.ps1`

```ps1
# This stupid script does the following:
#   - Download Windows XP wallpaper from imgur
#   - Set Windows volume on
#   - Set wallpaper to previously downloaded wallpaper via win32 API (without needing to logoff)
#   - Text to speech message
#   - Lock computer

$job = Start-Job -ScriptBlock {

Add-Type -AssemblyName System.speech

  # hit win32 API to actively update wallpaper, I'm not smart enough to code this myself
  # so here's the genius that actually did it
  #   https://stackoverflow.com/questions/9440135/powershell-script-from-shortcut-to-change-desktop/9440226#9440226
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using Microsoft.Win32;
  namespace Wallpaper {
    public enum Style : int {
      Tile, Center, Stretch, NoChange
    }
    public class Setter {
      public const int SetDesktopWallpaper = 20;
      public const int UpdateIniFile = 0x01;
      public const int SendWinIniChange = 0x02;
      [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
      private static extern int SystemParametersInfo (int uAction, int uParam, string lpvParam, int fuWinIni);
      public static void SetWallpaper ( string path, Wallpaper.Style style ) {
        SystemParametersInfo( SetDesktopWallpaper, 0, path, UpdateIniFile | SendWinIniChange );
        RegistryKey key = Registry.CurrentUser.OpenSubKey("Control Panel\\Desktop", true);
        switch(style){
          case Style.Stretch :
            key.SetValue(@"WallpaperStyle", "2") ; 
            key.SetValue(@"TileWallpaper", "0") ;
            break;
          case Style.Center :
            key.SetValue(@"WallpaperStyle", "1") ; 
            key.SetValue(@"TileWallpaper", "0") ; 
            break;
          case Style.Tile :
            key.SetValue(@"WallpaperStyle", "1") ; 
            key.SetValue(@"TileWallpaper", "1") ;
            break;
          case Style.NoChange :
            break;
        }
        key.Close();
      }
    }
  }
"@
  # https://stackoverflow.com/questions/21355891/change-audio-level-from-powershell
  Function Set-Speaker($Volume){
    $wshShell = new-object -com wscript.shell
    1..50 | ForEach-Object {
      $wshShell.SendKeys([char]174)
    }
    1..$Volume | ForEach-Object { 
      $wshShell.SendKeys([char]175)
    } 
  }

  $img_path = "c:/users/${env:UserName}/x.jpg"
  Invoke-WebRequest 'https://i.imgur.com/hzuxXQb.jpg' -outfile $img_path
  [Wallpaper.Setter]::SetWallpaper($img_path, 0)
  Set-Speaker(10)
  
  # Change monitor display settings to 'clone', decided to take this out
  # displayswitch.exe /clone

  [System.Console]::Beep(550, 1200)
  # https://www.pdq.com/blog/powershell-text-to-speech-examples/
  $tts = New-Object -TypeName System.Speech.Synthesis.SpeechSynthesizer
  $tts.Rate = -2
  $tts.Speak('Now executing power down sis on GMCC 400')
  $tts.Speak('5'); $tts.Speak('4'); $tts.Speak('3'); $tts.Speak('2'); $tts.Speak('1'); 
  [System.Console]::Beep(550, 1200)

  # eh...window spamming isn't really that fun
  #for ($i = 1; $i -le 10; $i++){
  #  [System.Threading.Thread]::Sleep(100)
  #  "[$i of 100]`n`n:(" > "./x.txt"
  #  Start-Process notepad "./x.txt" #-Wait -WindowStyle Maximized
  #}
}
Wait-Job $job | Out-Null
Receive-Job $job | Out-Null

rundll32.exe user32.dll, LockWorkStation
```

This was a lot of fun to make, but I honestly couldn't bring myself to prank
the more veteran IBM i developers at my company.

full gist - https://gist.github.com/barrettotte/b6654e5606831f13f48887de39d67723