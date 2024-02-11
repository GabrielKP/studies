#!/bin/sh
# Author: Gabriel Kressin

rsync -rv\
    --delete\
    www/ $1:~/psyserver/data/studies/study-fa

