@ECHO OFF
REM Batch script version of deploy.sh

SET GHUSER=barrettotte
SET GHIO=%GHUSER%.github.io

SET DIRCACHE=%CD%

IF "%~1"=="" GOTO:NOPARAMS

IF NOT EXIST "node_modules\" (
  ECHO Installing node modules...
  CALL npm install
)

IF NOT EXIST "..\%GHIO%\" (
  ECHO Could not find %GHIO% repository. Cloning fresh copy...
  git clone https://github.com/%GHUSER%/%GHIO%.git ../%GHIO% 
) ELSE (
  CD ..\%GHIO%\
  git pull
  CD %DIRCACHE%
)

CALL ng build --prod

FOR /D %%D IN ("..\%GHIO%\*.*") DO IF /I NOT "%%~nxD"==".git" RD /S /Q "%%D"
FOR %%F IN ("..\%GHIO%\*") DO DEL %%F

ROBOCOPY /S /E /NDL /NJH /NJS /NP /NS /NC dist\portfolio\ ..\%GHIO%\ 
COPY /Y misc\ghio-README.md ..\%GHIO%\README.md > nul

ECHO Pushing %GHUSER%/%GHIO% ...
CD ..\%GHIO%\
git add .
git commit -m "%~1"
git push origin master
GOTO:FINISH

:NOPARAMS
  ECHO No arguments supplied. Input commit message.
  GOTO:FINISH

:FINISH
  CD %DIRCACHE%
  ECHO Done.
