#!/bin/sh
# Author: Gabriel Kressin

rsync -rv\
    --delete\
    www/$1 $2:~/psyserver/data/studies/

