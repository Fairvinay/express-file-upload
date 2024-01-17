
@echo off
set fileToResize=%1
set /a uploaddate=%2;

set param="-resize 50%%"
set resizedFile=%fileToResize%_%uploaddate%"_.jpg"
"C:\Program Files\ImageMagick-7.1.0-Q16-HDRI\magick.exe"  %fileToResize% %param% %resizedFile%

REM -c 0 -brute -f 0 -g 4 -res 800 -l 9 -reduce -w 16 -srgb 2 "%fileToResize%" "%resizedFile%"


REM convert input_image.jpg -resize 50% output_image.jpg
REM magick rose.jpg -resize 50% rose.png