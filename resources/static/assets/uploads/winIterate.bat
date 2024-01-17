@echo off
setlocal EnableDelayedExpansion
REM count the files in G:\f\trades
REM get date of trade 
call winGetDate.bat
set cnt=0
set file[0]=""
for %%A in (*.png) do (
 set /a cnt+=1
 set "file[!cnt!]=%%A"
) 
echo file count =!cnt!
for %%P in (%%) do (
for /L %%i in (1,1,%cnt%) do (
 echo Processing: %%i- "!file[%%i]!"
 echo Output : "file%%i.jpg"
 magick "!file[%%i]!" -strip -interlace  Plane -gaussian-blur 0.05 -resize 50%%P "file_%tradedate%_%%i.jpg"
)
)
REM del *.png 
REM move *.jpg G:\f\trades
SETLOCAL
set var=0
:start

set /a var+=1

if "!var!" == "!cnt!" goto end
:: Code you want to run goes here
echo !var!
goto start

:end
echo var has reached !var!.
ENDLOCAL
pause
REM exit