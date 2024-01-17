REM 0gxWjJMsrF.png 0gxWjJMsrF_12oct2.png



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
 "G:\jee-neonvinay\eclipseox\tradesSC\Oct_Call_Put_FIIdata\pngcrush_1_8_11_w64.exe" -c 0 -brute -f 0 -g 4 -res 800 -l 9 -reduce -w 16 -srgb 2 "!file[%%i]!" "file_%tradedate%_%%i.jpg"
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